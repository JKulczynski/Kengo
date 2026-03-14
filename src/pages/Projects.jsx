import React, { useState, useEffect } from "react";
import { Project } from "@/api/entities";
import { Document } from "@/api/entities";
import { ProjectMember } from "@/api/entities";
import { User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, LayoutGrid, List, ArrowLeft, Calendar, DollarSign, Users, FileText, ExternalLink, Crown, Edit, Eye } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from 'date-fns';

import ProjectForm from "../components/projects/ProjectForm";
import ProjectCard from "../components/projects/ProjectCard";
import DeleteConfirmationDialog from "../components/projects/DeleteConfirmationDialog";

const statusConfig = {
  planning: { color: "bg-blue-50 text-blue-600", label: "Planowanie" },
  in_progress: { color: "bg-orange-50 text-orange-600", label: "W trakcie" },
  on_hold: { color: "bg-gray-50 text-gray-600", label: "Wstrzymany" },
  completed: { color: "bg-green-50 text-green-600", label: "Ukończony" }
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

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [members, setMembers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  
  // New state for project details view
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedProjectDocs, setSelectedProjectDocs] = useState([]);
  const [selectedProjectMembers, setSelectedProjectMembers] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [projectsData, documentsData, membersData, user] = await Promise.all([
          Project.list('-updated_date'),
          Document.list(),
          ProjectMember.list(),
          User.me()
      ]);
      setProjects(projectsData);
      setDocuments(documentsData);
      setMembers(membersData);
      setCurrentUser(user);
    } catch (error) {
      console.error("Error loading data:", error);
      setError("Nie udało się załadować projektów.");
    }
    setIsLoading(false);
  };

  const handleFormSubmit = async (projectData) => {
    try {
      if (editingProject) {
        await Project.update(editingProject.id, projectData);
      } else {
        await Project.create(projectData);
      }
      setIsFormOpen(false);
      setEditingProject(null);
      await loadData();
    } catch (error) {
      console.error("Error saving project:", error);
    }
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    setIsFormOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (projectToDelete) {
      try {
        await Project.delete(projectToDelete.id);
        const docsToDelete = documents.filter(d => d.project_id === projectToDelete.id);
        for (const doc of docsToDelete) {
          await Document.delete(doc.id);
        }
        setProjectToDelete(null);
        setSelectedProject(null); // Close detail view if deleting current project
        await loadData();
      } catch (error) {
        console.error("Error deleting project:", error);
      }
    }
  };

  const openDeleteDialog = (project) => {
    setProjectToDelete(project);
  };

  const handleProjectClick = (project) => {
    const projectDocs = documents.filter(d => d.project_id === project.id);
    const projectMembers = members.filter(m => m.project_id === project.id);
    
    setSelectedProject(project);
    setSelectedProjectDocs(projectDocs);
    setSelectedProjectMembers(projectMembers);
  };

  const backToList = () => {
    setSelectedProject(null);
    setSelectedProjectDocs([]);
    setSelectedProjectMembers([]);
  };

  // If a project is selected, show project details
  if (selectedProject) {
    const actualCost = selectedProjectDocs.reduce((sum, doc) => sum + (doc.amount || 0), 0);
    const budgetUsage = selectedProject.budget > 0 ? (actualCost / selectedProject.budget) * 100 : 0;

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="ghost"
              size="icon"
              onClick={backToList}
              className="hover:bg-gray-100 text-black"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-semibold text-black tracking-tight">
                {selectedProject.name}
              </h1>
              <p className="text-gray-500 mt-1 capitalize">
                {selectedProject.type?.replace(/_/g, ' ')} • {selectedProject.current_phase?.replace(/_/g, ' ') || 'Planning'}
              </p>
            </div>
            <Badge className={`${statusConfig[selectedProject.status]?.color} border-0 font-medium hidden sm:block`}>
              {statusConfig[selectedProject.status]?.label}
            </Badge>
          </div>

          {/* Project Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="apple-blur apple-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Data rozpoczęcia</p>
                    <p className="font-medium text-black">
                      {selectedProject.start_date ? format(new Date(selectedProject.start_date), 'dd.MM.yyyy') : 'Nie ustawiono'}
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
                    <p className="text-xs text-gray-500">Budżet</p>
                    <p className="font-medium text-black">
                      ${actualCost.toLocaleString()} / ${selectedProject.budget?.toLocaleString() || '0'}
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
                    <p className="text-xs text-gray-500">Zespół</p>
                    <p className="font-medium text-black">{selectedProjectMembers.length + 1} członków</p>
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
                    <p className="text-xs text-gray-500">Dokumenty</p>
                    <p className="font-medium text-black">{selectedProjectDocs.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Progress Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Progress Bar */}
            <Card className="apple-blur apple-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium text-black">Postęp projektu</h3>
                  <span className="text-sm font-medium text-black">
                    {selectedProject.progress_percentage || 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div 
                    className="bg-black rounded-full h-2"
                    style={{ width: `${selectedProject.progress_percentage || 0}%` }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Budget Progress */}
            {selectedProject.budget > 0 && (
              <Card className="apple-blur apple-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium text-black">Wykorzystanie budżetu</h3>
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
          </div>

          {/* Tabs */}
          <Tabs defaultValue="documents" className="space-y-6">
            <TabsList className="apple-blur">
              <TabsTrigger value="documents" className="text-black data-[state=active]:text-black data-[state=active]:bg-white">
                Dokumenty ({selectedProjectDocs.length})
              </TabsTrigger>
              <TabsTrigger value="team" className="text-black data-[state=active]:text-black data-[state=active]:bg-white">
                Zespół ({selectedProjectMembers.length + 1})
              </TabsTrigger>
              <TabsTrigger value="overview" className="text-black data-[state=active]:text-black data-[state=active]:bg-white">
                Przegląd
              </TabsTrigger>
            </TabsList>

            <TabsContent value="documents">
              <Card className="apple-blur apple-shadow">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-black">Dokumenty projektu</CardTitle>
                  <Link to={createPageUrl("Upload")}>
                    <Button size="sm" className="bg-blue-500 hover:bg-blue-600 text-white">
                      Dodaj dokument
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  {selectedProjectDocs.length > 0 ? (
                    <div className="space-y-4">
                      {selectedProjectDocs.map((doc) => {
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
                      <h3 className="font-medium text-black mb-2">Brak dokumentów</h3>
                      <p className="text-gray-500 mb-4">Wgraj pierwszy dokument, aby zacząć</p>
                      <Link to={createPageUrl("Upload")}>
                        <Button className="bg-blue-500 hover:bg-blue-600 text-white">
                          Dodaj dokument
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
                  <CardTitle className="text-black">Członkowie zespołu</CardTitle>
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
                          {selectedProject.created_by === currentUser?.email ? 'You' : selectedProject.created_by}
                        </h4>
                        <p className="text-sm text-gray-500">Właściciel projektu</p>
                      </div>
                      <Badge className="bg-purple-50 text-purple-600 border-0">Właściciel</Badge>
                    </div>

                    {/* Team Members */}
                    {selectedProjectMembers.map((member) => {
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
                              Zaproszony przez {member.invited_by}
                            </p>
                          </div>
                          <Badge className={`border-0 ${
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
                  <CardTitle className="text-black">Przegląd projektu</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {selectedProject.description && (
                      <div>
                        <h4 className="font-medium text-black mb-2">Opis</h4>
                        <p className="text-gray-600">{selectedProject.description}</p>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium text-black mb-2">Szczegóły projektu</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Typ:</span>
                            <span className="text-black capitalize">{selectedProject.type?.replace(/_/g, ' ')}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Status:</span>
                            <span className="text-black">{statusConfig[selectedProject.status]?.label || selectedProject.status}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Postęp:</span>
                            <span className="text-black">{selectedProject.progress_percentage || 0}%</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-black mb-2">Harmonogram</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Data rozpoczęcia:</span>
                            <span className="text-black">
                              {selectedProject.start_date ? format(new Date(selectedProject.start_date), 'dd.MM.yyyy') : 'Nie ustawiono'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Planowane zakończenie:</span>
                            <span className="text-black">
                              {selectedProject.target_completion ? format(new Date(selectedProject.target_completion), 'dd.MM.yyyy') : 'Nie ustawiono'}
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

  // Default view - project list
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 md:mb-12 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-semibold text-black tracking-tight">
              Wszystkie projekty
            </h1>
            <p className="text-base md:text-lg text-gray-500 font-normal mt-2">
              Zarządzaj swoimi projektami remontowymi
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="text-gray-400 hover:text-black"
            >
              {viewMode === 'grid' ? <List className="w-5 h-5" /> : <LayoutGrid className="w-5 h-5" />}
            </Button>
            <Button
              onClick={() => { setEditingProject(null); setIsFormOpen(true); }}
              className="bg-black text-white hover:bg-gray-800 rounded-lg text-sm font-medium"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nowy projekt
            </Button>
          </div>
        </div>
        
        {/* Projects Grid/List */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 rounded-xl border border-red-100 flex items-center justify-between">
            <p className="text-red-600 text-sm">{error}</p>
            <Button size="sm" variant="outline" onClick={loadData} className="ml-4 text-sm">
              Spróbuj ponownie
            </Button>
          </div>
        )}

        <AnimatePresence>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array(6).fill(0).map((_, i) => (
                <div key={i} className="h-48 bg-gray-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : projects.length > 0 ? (
            <div className={`grid gap-6 md:gap-8 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
              {projects.map((project) => {
                const projectDocs = documents.filter(d => d.project_id === project.id);
                const actualCost = projectDocs.reduce((sum, doc) => sum + (doc.amount || 0), 0);
                
                return (
                  <div 
                    key={project.id}
                    onClick={() => handleProjectClick(project)}
                    className="cursor-pointer"
                  >
                    <ProjectCard 
                      project={{...project, actualCost}}
                      onEdit={handleEdit}
                      onDelete={openDeleteDialog}
                      viewMode={viewMode}
                    />
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-24 apple-blur rounded-2xl">
              <div className="w-16 h-16 mx-auto mb-6 bg-gray-100 rounded-2xl flex items-center justify-center">
                <Plus className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-medium text-black mb-2">
                Utwórz swój pierwszy projekt
              </h3>
              <p className="text-gray-500 mb-6">
                Zacznij od zaplanowania kolejnego remontu.
              </p>
              <Button
                onClick={() => setIsFormOpen(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium"
              >
                Utwórz projekt
              </Button>
            </div>
          )}
        </AnimatePresence>
      </div>

      <ProjectForm 
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        project={editingProject}
      />

      <DeleteConfirmationDialog 
        isOpen={!!projectToDelete}
        onClose={() => setProjectToDelete(null)}
        onConfirm={handleDeleteConfirm}
        projectName={projectToDelete?.name}
      />
    </div>
  );
}