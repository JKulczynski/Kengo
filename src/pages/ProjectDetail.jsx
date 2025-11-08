import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Project } from '@/api/entities';
import { Document } from '@/api/entities';
import { ProjectMember } from '@/api/entities';
import { User } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { createPageUrl } from '@/utils';
import { 
    ArrowLeft, 
    Calendar, 
    DollarSign, 
    Users, 
    FileText, 
    Settings,
    Edit,
    Crown,
    Eye,
    ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

const statusConfig = {
  planning: { color: "bg-blue-50 text-blue-600", label: "Planning" },
  in_progress: { color: "bg-orange-50 text-orange-600", label: "In Progress" },
  on_hold: { color: "bg-gray-50 text-gray-600", label: "On Hold" },
  completed: { color: "bg-green-50 text-green-600", label: "Completed" }
};

const typeIcons = {
  invoice: FileText,
  receipt: FileText,
  photo: FileText,
  blueprint: FileText,
  contract: FileText,
  other: FileText
};

const roleIcons = {
  owner: Crown,
  editor: Edit,
  viewer: Eye
};

export default function ProjectDetailPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [members, setMembers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadProjectData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [projectData, user] = await Promise.all([
        Project.filter({ id: projectId }),
        User.me()
      ]);
      
      if (projectData.length > 0) {
        setProject(projectData[0]);
        setCurrentUser(user);
        
        // Load project documents and members
        const [docsData, membersData] = await Promise.all([
          Document.filter({ project_id: projectId }),
          ProjectMember.filter({ project_id: projectId })
        ]);
        
        setDocuments(docsData);
        setMembers(membersData);
      } else {
        navigate(createPageUrl('Projects'));
      }
    } catch (error) {
      console.error("Error loading project data:", error);
      navigate(createPageUrl('Projects'));
    }
    setIsLoading(false);
  }, [projectId, navigate]);

  useEffect(() => {
    loadProjectData();
  }, [loadProjectData]);

  const actualCost = documents.reduce((sum, doc) => sum + (doc.amount || 0), 0);
  const budgetUsage = project?.budget > 0 ? (actualCost / project.budget) * 100 : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
          <Skeleton className="h-8 w-64 mb-8" />
          <div className="grid gap-6">
            <Skeleton className="h-48 w-full rounded-2xl" />
            <Skeleton className="h-96 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-medium text-black">Project not found</h2>
          <Link to={createPageUrl('Projects')}>
            <Button className="mt-4 bg-blue-500 hover:bg-blue-600 text-white">
              Back to Projects
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(createPageUrl("Dashboard"))}
            className="hover:bg-gray-100 text-black"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-semibold text-black tracking-tight">
              {project.name}
            </h1>
            <p className="text-gray-500 mt-1 capitalize">
              {project.type?.replace(/_/g, ' ')} • {project.current_phase?.replace(/_/g, ' ') || 'Planning'}
            </p>
          </div>
          <Badge className={`${statusConfig[project.status]?.color} border-0 font-medium hidden sm:block`}>
            {statusConfig[project.status]?.label}
          </Badge>
        </div>

        {/* Project Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="apple-blur apple-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Start Date</p>
                  <p className="font-medium text-black">
                    {project.start_date ? format(new Date(project.start_date), 'MMM d, yyyy') : 'Not set'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="apple-blur apple-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Budget</p>
                  <p className="font-medium text-black">
                    ${actualCost.toLocaleString()} / ${project.budget?.toLocaleString() || '0'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="apple-blur apple-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Team</p>
                  <p className="font-medium text-black">{members.length + 1} members</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="apple-blur apple-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Documents</p>
                  <p className="font-medium text-black">{documents.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress Bar */}
        {project.budget > 0 && (
          <Card className="apple-blur apple-shadow mb-8">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium text-black">Budget Progress</h3>
                <span className={`text-sm font-medium ${budgetUsage > 100 ? 'text-red-500' : 'text-black'}`}>
                  {budgetUsage.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    budgetUsage > 100 ? 'bg-red-500' : 
                    budgetUsage > 75 ? 'bg-orange-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(budgetUsage, 100)}%` }}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs defaultValue="documents" className="space-y-6">
          <TabsList className="apple-blur">
            <TabsTrigger value="documents" className="text-black data-[state=active]:text-black">Documents ({documents.length})</TabsTrigger>
            <TabsTrigger value="team" className="text-black data-[state=active]:text-black">Team ({members.length + 1})</TabsTrigger>
            <TabsTrigger value="overview" className="text-black data-[state=active]:text-black">Overview</TabsTrigger>
          </TabsList>

          <TabsContent value="documents">
            <Card className="apple-blur apple-shadow">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-black">Project Documents</CardTitle>
                <Link to={createPageUrl("Upload")}>
                  <Button size="sm" className="bg-blue-500 hover:bg-blue-600 text-white">
                    Add Document
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {documents.length > 0 ? (
                  <div className="space-y-4">
                    {documents.map((doc) => {
                      const TypeIcon = typeIcons[doc.type] || FileText;
                      return (
                        <div key={doc.id} className="flex items-center gap-4 p-4 rounded-lg bg-white border">
                          <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center">
                            <TypeIcon className="w-5 h-5 text-gray-500" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-black">{doc.title}</h4>
                            <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                              {doc.vendor && <span>Vendor: {doc.vendor}</span>}
                              {doc.amount && <span className="text-green-600">${doc.amount.toLocaleString()}</span>}
                              {doc.date && <span>{format(new Date(doc.date), 'MMM d, yyyy')}</span>}
                            </div>
                          </div>
                          <a 
                            href={doc.file_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:text-blue-600"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="font-medium text-black mb-2">No documents yet</h3>
                    <p className="text-gray-500 mb-4">Upload your first document to get started</p>
                    <Link to={createPageUrl("Upload")}>
                      <Button className="bg-blue-500 hover:bg-blue-600 text-white">
                        Add Document
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="team">
            <Card className="apple-blur apple-shadow">
              <CardHeader>
                <CardTitle className="text-black">Team Members</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Project Owner */}
                  <div className="flex items-center gap-4 p-4 rounded-lg bg-white border">
                    <div className="w-10 h-10 bg-purple-50 rounded-full flex items-center justify-center">
                      <Crown className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-black">
                        {project.created_by === currentUser?.email ? 'You' : project.created_by}
                      </h4>
                      <p className="text-sm text-gray-500">Project Owner</p>
                    </div>
                    <Badge className="bg-purple-50 text-purple-600">Owner</Badge>
                  </div>

                  {/* Team Members */}
                  {members.map((member) => {
                    const RoleIcon = roleIcons[member.role];
                    return (
                      <div key={member.id} className="flex items-center gap-4 p-4 rounded-lg bg-white border">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          member.role === 'editor' ? 'bg-blue-50' : 'bg-gray-50'
                        }`}>
                          <RoleIcon className={`w-5 h-5 ${
                            member.role === 'editor' ? 'text-blue-600' : 'text-gray-600'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-black">
                            {member.user_email === currentUser?.email ? 'You' : member.user_email}
                          </h4>
                          <p className="text-sm text-gray-500">
                            Invited by {member.invited_by}
                          </p>
                        </div>
                        <Badge className={`${
                          member.role === 'editor' ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-600'
                        }`}>
                          {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="overview">
            <Card className="apple-blur apple-shadow">
              <CardHeader>
                <CardTitle className="text-black">Project Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {project.description && (
                    <div>
                      <h4 className="font-medium text-black mb-2">Description</h4>
                      <p className="text-gray-600">{project.description}</p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-black mb-2">Project Details</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Type:</span>
                          <span className="text-black capitalize">{project.type?.replace(/_/g, ' ')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Status:</span>
                          <span className="text-black capitalize">{project.status?.replace(/_/g, ' ')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Progress:</span>
                          <span className="text-black">{project.progress_percentage || 0}%</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-black mb-2">Timeline</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Start Date:</span>
                          <span className="text-black">
                            {project.start_date ? format(new Date(project.start_date), 'MMM d, yyyy') : 'Not set'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Target Completion:</span>
                          <span className="text-black">
                            {project.target_completion ? format(new Date(project.target_completion), 'MMM d, yyyy') : 'Not set'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}