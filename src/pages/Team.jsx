
import React, { useState, useEffect, useCallback } from 'react';
import { ProjectMember } from '@/api/entities';
import { Project } from '@/api/entities';
import { User } from '@/api/entities';
import { SendEmail } from '@/api/integrations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
    Users, 
    UserPlus, 
    Mail, 
    Crown, 
    Edit, 
    Eye, 
    Trash2,
    Search,
    Filter,
    MoreVertical
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Skeleton } from '@/components/ui/skeleton';

const roleIcons = {
  owner: Crown,
  editor: Edit,
  viewer: Eye
};

const roleColors = {
  owner: "bg-purple-100 text-purple-800",
  editor: "bg-blue-100 text-blue-800",
  viewer: "bg-gray-100 text-gray-800"
};

const statusColors = {
  active: "bg-green-100 text-green-800",
  pending: "bg-yellow-100 text-yellow-800",
  inactive: "bg-red-100 text-red-800"
};

export default function TeamPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  
  // Invite form states
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('viewer');
  const [inviteProject, setInviteProject] = useState('');
  const [isInviting, setIsInviting] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [user, projectsData, membersData] = await Promise.all([
        User.me(),
        Project.list('-updated_date'),
        ProjectMember.list('-created_date')
      ]);
      
      setCurrentUser(user);
      setProjects(projectsData);
      setMembers(membersData);
    } catch (error) {
      console.error("Error loading team data:", error);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredMembers = members.filter(member => {
    // Search filter
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      if (!member.user_email.toLowerCase().includes(searchLower)) {
        return false;
      }
    }

    // Project filter
    if (selectedProject !== 'all' && member.project_id !== selectedProject) {
      return false;
    }

    // Role filter
    if (roleFilter !== 'all' && member.role !== roleFilter) {
      return false;
    }

    return true;
  });

  const getProjectName = (projectId) => {
    return projects.find(p => p.id === projectId)?.name || 'Unknown Project';
  };

  const canManageMember = (member) => {
    const project = projects.find(p => p.id === member.project_id);
    if (!project || !currentUser) return false;

    // Właściciel projektu może zarządzać wszystkimi
    if (project.created_by === currentUser.email) return true;

    // Sprawdź czy current user ma uprawnienia w tym projekcie
    const currentUserMember = members.find(m => 
      m.project_id === member.project_id && 
      m.user_email === currentUser.email
    );
    
    return currentUserMember?.role === 'owner' || currentUserMember?.role === 'editor';
  };

  const sendInvitation = async () => {
    if (!inviteEmail.trim() || !inviteProject) return;
    
    setIsInviting(true);
    try {
      // Sprawdź czy użytkownik już jest w tym projekcie
      const existingMember = members.find(m => 
        m.user_email === inviteEmail && 
        m.project_id === inviteProject
      );
      
      if (existingMember) {
        alert("Ten użytkownik już jest członkiem tego projektu.");
        return;
      }

      const project = projects.find(p => p.id === inviteProject);
      
      await ProjectMember.create({
        project_id: inviteProject,
        user_email: inviteEmail,
        role: inviteRole,
        invited_by: currentUser.email,
        status: 'pending',
        permissions: getPermissionsForRole(inviteRole)
      });

      // Wyślij email z zaproszeniem
      await SendEmail({
        to: inviteEmail,
        subject: `Zaproszenie do projektu: ${project.name}`,
        body: `Witaj!\n\n${currentUser.full_name} zaprosił Cię do współpracy nad projektem remontowym "${project.name}" w aplikacji RenovateAI.\n\nTwoja rola: ${getRoleDisplayName(inviteRole)}\n\nZaloguj się do aplikacji RenovateAI, aby dołączyć do projektu.\n\nPozdrawiam,\nZespół RenovateAI`
      });

      // Reset form
      setInviteEmail('');
      setInviteRole('viewer');
      setInviteProject('');
      
      await loadData();
      
    } catch (error) {
      console.error("Error sending invitation:", error);
      alert("Wystąpił błąd podczas wysyłania zaproszenia.");
    }
    setIsInviting(false);
  };

  const removeMember = async (memberId) => {
    try {
      await ProjectMember.delete(memberId);
      await loadData();
    } catch (error) {
      console.error("Error removing member:", error);
    }
  };

  const getPermissionsForRole = (role) => {
    switch (role) {
      case 'owner':
        return {
          can_edit_project: true,
          can_delete_project: true,
          can_add_documents: true,
          can_delete_documents: true,
          can_invite_members: true
        };
      case 'editor':
        return {
          can_edit_project: true,
          can_delete_project: false,
          can_add_documents: true,
          can_delete_documents: true,
          can_invite_members: true
        };
      case 'viewer':
      default:
        return {
          can_edit_project: false,
          can_delete_project: false,
          can_add_documents: false,
          can_delete_documents: false,
          can_invite_members: false
        };
    }
  };

  const getRoleDisplayName = (role) => {
    const names = {
      owner: 'Właściciel',
      editor: 'Edytor',
      viewer: 'Przeglądający'
    };
    return names[role] || role;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <Skeleton className="h-10 w-48 mb-8" />
          <div className="grid gap-6">
            {Array(5).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-semibold text-black tracking-tight mb-3">
            Team Management
          </h1>
          <p className="text-lg text-gray-500">
            Manage team members and collaborate on your renovation projects
          </p>
        </div>

        <Tabs defaultValue="members" className="space-y-8">
          <TabsList className="apple-blur">
            <TabsTrigger value="members" className="flex items-center gap-2 text-black">
              <Users className="w-4 h-4" />
              Team Members ({members.length})
            </TabsTrigger>
            <TabsTrigger value="invite" className="flex items-center gap-2 text-black">
              <UserPlus className="w-4 h-4" />
              Invite Member
            </TabsTrigger>
          </TabsList>

          <TabsContent value="members" className="space-y-6">
            {/* Filters */}
            <Card className="apple-blur apple-shadow">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search by email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <Select value={selectedProject} onValueChange={setSelectedProject}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Projects" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Projects</SelectItem>
                      {projects.map(project => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Roles" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="owner">Owner</SelectItem>
                      <SelectItem value="editor">Editor</SelectItem>
                      <SelectItem value="viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex justify-between items-center mt-4">
                  <p className="text-sm text-gray-500">
                    {filteredMembers.length} of {members.length} members
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedProject('all');
                      setRoleFilter('all');
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Members List */}
            {filteredMembers.length > 0 ? (
              <div className="grid gap-4">
                {filteredMembers.map((member) => {
                  const RoleIcon = roleIcons[member.role];
                  const project = projects.find(p => p.id === member.project_id);
                  
                  return (
                    <Card key={member.id} className="apple-blur apple-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                              member.role === 'owner' ? 'bg-purple-100' :
                              member.role === 'editor' ? 'bg-blue-100' :
                              'bg-gray-100'
                            }`}>
                              <RoleIcon className={`w-6 h-6 ${
                                member.role === 'owner' ? 'text-purple-600' :
                                member.role === 'editor' ? 'text-blue-600' :
                                'text-gray-600'
                              }`} />
                            </div>
                            
                            <div>
                              <h3 className="font-semibold text-black">
                                {member.user_email === currentUser?.email ? 'You' : member.user_email}
                              </h3>
                              <p className="text-sm text-gray-500">
                                {getProjectName(member.project_id)}
                              </p>
                              <p className="text-xs text-gray-400">
                                Invited by {member.invited_by}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <Badge className={roleColors[member.role]}>
                              <RoleIcon className="w-3 h-3 mr-1" />
                              {getRoleDisplayName(member.role)}
                            </Badge>
                            
                            <Badge className={statusColors[member.status]}>
                              {member.status === 'active' ? 'Active' : 
                               member.status === 'pending' ? 'Pending' : 'Inactive'}
                            </Badge>
                            
                            {canManageMember(member) && member.user_email !== currentUser?.email && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600">
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="apple-blur">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to remove {member.user_email} from {getProjectName(member.project_id)}? 
                                      They will lose access to all project documents.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction 
                                      onClick={() => removeMember(member.id)}
                                      className="bg-red-500 hover:bg-red-600"
                                    >
                                      Remove
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card className="apple-blur">
                <CardContent className="text-center py-12">
                  <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-black mb-2">
                    No team members found
                  </h3>
                  <p className="text-gray-500">
                    {members.length === 0 
                      ? "Start collaborating by inviting team members to your projects"
                      : "Try adjusting your search or filter criteria"
                    }
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="invite">
            <Card className="apple-blur apple-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5" />
                  Invite New Team Member
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="invite-email">Email Address</Label>
                  <Input
                    id="invite-email"
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="colleague@example.com"
                  />
                </div>

                <div>
                  <Label>Project</Label>
                  <Select value={inviteProject} onValueChange={setInviteProject}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a project" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map(project => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Role</Label>
                  <Select value={inviteRole} onValueChange={setInviteRole}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="viewer">Viewer - Can view projects and documents</SelectItem>
                      <SelectItem value="editor">Editor - Can edit projects and documents</SelectItem>
                      <SelectItem value="owner">Owner - Full project control</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={sendInvitation}
                  disabled={isInviting || !inviteEmail.trim() || !inviteProject}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                >
                  {isInviting ? (
                    <>Sending Invitation...</>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      Send Invitation
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
