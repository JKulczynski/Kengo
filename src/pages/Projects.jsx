import React, { useState, useEffect } from "react";
import { Project } from "@/api/entities";
import { Document } from "@/api/entities";
import { ProjectMember } from "@/api/entities";
import { User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, LayoutGrid, List, ArrowLeft, Calendar, DollarSign, Users, FileText, ExternalLink, Crown, Edit, Eye, Trash2 } from "lucide-react";
import { toast } from 'sonner';
import { AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from 'date-fns';

import ProjectForm from "../components/projects/ProjectForm";
import ProjectCard from "../components/projects/ProjectCard";
import DeleteConfirmationDialog from "../components/projects/DeleteConfirmationDialog";

const statusConfig = {
  planning:    { label: "Planowanie",  style: { backgroundColor: "var(--k-icon-bg)",  color: "var(--k-icon-color)" } },
  in_progress: { label: "W trakcie",   style: { backgroundColor: "var(--k-warn-bg)",  color: "var(--k-warn-color)" } },
  completed:   { label: "Ukończony",   style: { backgroundColor: "var(--k-ok-bg)",    color: "var(--k-ok-color)" } },
  on_hold:     { label: "Wstrzymany",  style: { backgroundColor: "var(--k-err-bg)",   color: "var(--k-err-color)" } },
};

const typeIcons = {
  invoice: FileText,
  receipt: FileText,
  photo: FileText,
  blueprint: FileText,
  contract: FileText,
  other: FileText
};

const TYPE_LABELS = {
  kitchen: 'Kuchnia', bathroom: 'Łazienka', living_room: 'Salon',
  bedroom: 'Sypialnia', outdoor: 'Ogród/Zewnątrz', whole_house: 'Cały dom',
  basement: 'Piwnica', attic: 'Strych', other: 'Inne'
};

const roleIcons = {
  owner: Crown,
  editor: Edit,
  viewer: Eye
};

export default function ProjectsPage() {
  const navigate = useNavigate();
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
    const clean = {
      ...projectData,
      start_date: projectData.start_date || null,
      target_completion: projectData.target_completion || null,
      budget: projectData.budget || null,
    };
    try {
      if (editingProject) {
        await Project.update(editingProject.id, clean);
        setIsFormOpen(false);
        setEditingProject(null);
        await loadData();
        toast.success('Projekt zaktualizowany');
      } else {
        await Project.create(clean);
        setIsFormOpen(false);
        setEditingProject(null);
        await loadData();
        toast.success('Projekt utworzony');
      }
    } catch (error) {
      console.error("Error saving project:", error);
      toast.error(`Błąd: ${error.message}`);
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
        toast.success('Projekt usunięty');
      } catch (error) {
        console.error("Error deleting project:", error);
        toast.error('Coś poszło nie tak. Spróbuj ponownie.');
      }
    }
  };

  const openDeleteDialog = (project) => {
    setProjectToDelete(project);
  };

  const handleProjectClick = (project) => {
    navigate(`/project/${project.id}`);
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
      <div className="min-h-screen" style={{ backgroundColor: "var(--k-bg)" }}>
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="ghost"
              size="icon"
              onClick={backToList}
              style={{ color: "var(--k-text)" }}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-semibold tracking-tight" style={{ color: "var(--k-text)" }}>
                {selectedProject.name}
              </h1>
              <p className="mt-1" style={{ color: "var(--k-text-muted)" }}>
                {TYPE_LABELS[selectedProject.type] || selectedProject.type?.replace(/_/g, ' ')}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge style={statusConfig[selectedProject.status]?.style} className="border-0 font-medium hidden sm:block">
                {statusConfig[selectedProject.status]?.label}
              </Badge>
              <Button variant="ghost" size="icon" className="w-9 h-9 rounded-full" onClick={() => handleEdit(selectedProject)} style={{ color: "var(--k-text)" }}>
                <Edit className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="w-9 h-9 rounded-full" onClick={() => openDeleteDialog(selectedProject)} style={{ color: "var(--k-err-color)" }}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Project Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="apple-blur apple-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="icon-box w-10 h-10 rounded-xl flex items-center justify-center">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: "var(--k-text-muted)" }}>Data rozpoczęcia</p>
                    <p className="font-medium" style={{ color: "var(--k-text)" }}>
                      {selectedProject.start_date ? format(new Date(selectedProject.start_date), 'dd.MM.yyyy') : 'Nie ustawiono'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="apple-blur apple-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="icon-box w-10 h-10 rounded-xl flex items-center justify-center">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: "var(--k-text-muted)" }}>Budżet</p>
                    <p className="font-medium" style={{ color: "var(--k-text)" }}>
                      {actualCost.toLocaleString('pl-PL')} zł / {(selectedProject.budget || 0).toLocaleString('pl-PL')} zł
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="apple-blur apple-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="icon-box w-10 h-10 rounded-xl flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: "var(--k-text-muted)" }}>Zespół</p>
                    <p className="font-medium" style={{ color: "var(--k-text)" }}>
                      {(() => {
                        const n = selectedProjectMembers.length + 1;
                        if (n === 1) return '1 członek';
                        if (n >= 2 && n <= 4) return `${n} członków`;
                        return `${n} członków`;
                      })()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="apple-blur apple-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="icon-box w-10 h-10 rounded-xl flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: "var(--k-text-muted)" }}>Dokumenty</p>
                    <p className="font-medium" style={{ color: "var(--k-text)" }}>{selectedProjectDocs.length}</p>
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
                  <h3 className="font-medium" style={{ color: "var(--k-text)" }}>Postęp projektu</h3>
                  <span className="text-sm font-medium" style={{ color: "var(--k-text)" }}>
                    {selectedProject.progress_percentage || 0}%
                  </span>
                </div>
                <div className="w-full rounded-full h-2" style={{ backgroundColor: "var(--k-border)" }}>
                  <div
                    className="rounded-full h-2"
                    style={{ width: `${selectedProject.progress_percentage || 0}%`, backgroundColor: "var(--k-accent)" }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Budget Progress */}
            {selectedProject.budget > 0 && (
              <Card className="apple-blur apple-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium" style={{ color: "var(--k-text)" }}>Wykorzystanie budżetu</h3>
                    <span className="text-sm font-medium" style={{ color: budgetUsage > 100 ? "var(--k-err-color)" : "var(--k-text)" }}>
                      {budgetUsage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full rounded-full h-2" style={{ backgroundColor: "var(--k-border)" }}>
                    <div
                      className="h-2 rounded-full"
                      style={{
                        width: `${Math.min(budgetUsage, 100)}%`,
                        backgroundColor: budgetUsage > 100 ? "var(--k-err-color)" : budgetUsage > 75 ? "#f59e0b" : "var(--k-accent)"
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Tabs */}
          <Tabs defaultValue="documents" className="space-y-6">
            <TabsList className="apple-blur">
              <TabsTrigger value="documents">
                Dokumenty ({selectedProjectDocs.length})
              </TabsTrigger>
              <TabsTrigger value="team">
                Zespół ({selectedProjectMembers.length + 1})
              </TabsTrigger>
              <TabsTrigger value="overview">
                Przegląd
              </TabsTrigger>
            </TabsList>

            <TabsContent value="documents">
              <Card className="apple-blur apple-shadow">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle style={{ color: "var(--k-text)" }}>Dokumenty projektu</CardTitle>
                  <Link to={createPageUrl("Upload")}>
                    <Button size="sm" className="btn-primary">
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
                          <div key={doc.id} className="flex items-center gap-4 p-4 rounded-lg" style={{ backgroundColor: "var(--k-bg-surface)", border: "1px solid var(--k-border)" }}>
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center icon-box">
                              <TypeIcon className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium" style={{ color: "var(--k-text)" }}>{doc.title}</h4>
                              <div className="flex items-center gap-4 text-sm mt-1" style={{ color: "var(--k-text-muted)" }}>
                                {doc.vendor && <span>Vendor: {doc.vendor}</span>}
                                {doc.amount && <span className="text-green-600">{doc.amount.toLocaleString('pl-PL')} zł</span>}
                                {doc.date && <span>{format(new Date(doc.date), 'dd.MM.yyyy')}</span>}
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
                      <FileText className="w-12 h-12 mx-auto mb-4" style={{ color: "var(--k-text-subtle)" }} />
                      <h3 className="font-medium mb-2" style={{ color: "var(--k-text)" }}>Brak dokumentów</h3>
                      <p className="mb-4" style={{ color: "var(--k-text-muted)" }}>Wgraj pierwszy dokument, aby zacząć</p>
                      <Link to={createPageUrl("Upload")}>
                        <Button className="btn-primary">
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
                  <CardTitle style={{ color: "var(--k-text)" }}>Członkowie zespołu</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Project Owner */}
                    <div className="flex items-center gap-4 p-4 rounded-lg" style={{ backgroundColor: "var(--k-bg-surface)", border: "1px solid var(--k-border)" }}>
                      <div className="icon-box w-10 h-10 rounded-full flex items-center justify-center">
                        <Crown className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium" style={{ color: "var(--k-text)" }}>
                          {selectedProject.created_by === currentUser?.email ? 'Ty' : selectedProject.created_by}
                        </h4>
                        <p className="text-sm" style={{ color: "var(--k-text-muted)" }}>Właściciel projektu</p>
                      </div>
                      <Badge style={{ backgroundColor: "var(--k-icon-bg)", color: "var(--k-icon-color)" }} className="border-0">Właściciel</Badge>
                    </div>

                    {/* Team Members */}
                    {selectedProjectMembers.map((member) => {
                      const RoleIcon = roleIcons[member.role];
                      return (
                        <div key={member.id} className="flex items-center gap-4 p-4 rounded-lg" style={{ backgroundColor: "var(--k-bg-surface)", border: "1px solid var(--k-border)" }}>
                          <div className="icon-box w-10 h-10 rounded-full flex items-center justify-center">
                            <RoleIcon className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium" style={{ color: "var(--k-text)" }}>
                              {member.user_email === currentUser?.email ? 'Ty' : member.user_email}
                            </h4>
                            <p className="text-sm" style={{ color: "var(--k-text-muted)" }}>
                              Zaproszony przez {member.invited_by}
                            </p>
                          </div>
                          <Badge style={{ backgroundColor: "var(--k-icon-bg)", color: "var(--k-icon-color)" }} className="border-0">
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
                  <CardTitle style={{ color: "var(--k-text)" }}>Przegląd projektu</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {selectedProject.description && (
                      <div>
                        <h4 className="font-medium mb-2" style={{ color: "var(--k-text)" }}>Opis</h4>
                        <p style={{ color: "var(--k-text-muted)" }}>{selectedProject.description}</p>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium mb-2" style={{ color: "var(--k-text)" }}>Szczegóły projektu</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span style={{ color: "var(--k-text-muted)" }}>Typ:</span>
                            <span style={{ color: "var(--k-text)" }}>{TYPE_LABELS[selectedProject.type] || selectedProject.type?.replace(/_/g, ' ')}</span>
                          </div>
                          <div className="flex justify-between">
                            <span style={{ color: "var(--k-text-muted)" }}>Status:</span>
                            <span style={{ color: "var(--k-text)" }}>{statusConfig[selectedProject.status]?.label || selectedProject.status}</span>
                          </div>
                          <div className="flex justify-between">
                            <span style={{ color: "var(--k-text-muted)" }}>Postęp:</span>
                            <span style={{ color: "var(--k-text)" }}>{selectedProject.progress_percentage || 0}%</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2" style={{ color: "var(--k-text)" }}>Harmonogram</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span style={{ color: "var(--k-text-muted)" }}>Data rozpoczęcia:</span>
                            <span style={{ color: "var(--k-text)" }}>
                              {selectedProject.start_date ? format(new Date(selectedProject.start_date), 'dd.MM.yyyy') : 'Nie ustawiono'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span style={{ color: "var(--k-text-muted)" }}>Planowane zakończenie:</span>
                            <span style={{ color: "var(--k-text)" }}>
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
    <div className="min-h-screen" style={{ backgroundColor: "var(--k-bg)" }}>
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 md:mb-12 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight" style={{ color: "var(--k-text)" }}>
              Wszystkie projekty
            </h1>
            <p className="text-base md:text-lg font-normal mt-2" style={{ color: "var(--k-text-muted)" }}>
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
              className="btn-primary rounded-lg text-sm font-medium"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nowy projekt
            </Button>
          </div>
        </div>
        
        {/* Projects Grid/List */}
        {error && (
          <div className="mb-8 p-4 rounded-xl flex items-center justify-between" style={{ backgroundColor: "var(--k-err-bg)", border: "1px solid var(--k-border-md)" }}>
            <p className="text-sm" style={{ color: "var(--k-err-color)" }}>{error}</p>
            <Button size="sm" variant="outline" onClick={loadData} className="ml-4 text-sm">
              Spróbuj ponownie
            </Button>
          </div>
        )}

        <AnimatePresence>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array(6).fill(0).map((_, i) => (
                <div key={i} className="h-48 rounded-2xl animate-pulse" style={{ backgroundColor: "var(--k-border)" }} />
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
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center" style={{ backgroundColor: "var(--k-accent-light)" }}>
                <Plus className="w-8 h-8" style={{ color: "var(--k-accent)" }} />
              </div>
              <h3 className="text-xl font-medium mb-2" style={{ color: "var(--k-text)" }}>
                Utwórz swój pierwszy projekt
              </h3>
              <p className="mb-6 max-w-md mx-auto" style={{ color: "var(--k-text-muted)" }}>
                Twoja przestrzeń remontowa czeka. Dodaj pierwszy projekt i zacznij zarządzać budżetem, harmonogramem i dokumentami w jednym miejscu.
              </p>
              <Button
                onClick={() => setIsFormOpen(true)}
                className="btn-primary rounded-lg text-sm font-medium"
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