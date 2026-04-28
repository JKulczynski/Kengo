import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Project } from '@/api/entities';
import { Document } from '@/api/entities';
import { ProjectMember } from '@/api/entities';
import { User } from '@/api/entities';
import { Note } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { createPageUrl } from '@/utils';
import {
    ArrowLeft,
    Calendar,
    DollarSign,
    Users,
    FileText,
    Edit,
    Crown,
    Eye,
    ExternalLink,
    Image,
    File,
    Receipt,
    CheckSquare,
    Square,
    Plus,
    Trash2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import { toast } from 'sonner';
import ProjectForm from '@/components/projects/ProjectForm';
import DeleteConfirmationDialog from '@/components/projects/DeleteConfirmationDialog';

const statusConfig = {
  planning:    { label: "Planowanie", style: { backgroundColor: "var(--k-icon-bg)",  color: "var(--k-icon-color)" } },
  in_progress: { label: "W trakcie",  style: { backgroundColor: "var(--k-warn-bg)",  color: "var(--k-warn-color)" } },
  completed:   { label: "Ukończony",  style: { backgroundColor: "var(--k-ok-bg)",    color: "var(--k-ok-color)" } },
  on_hold:     { label: "Wstrzymany", style: { backgroundColor: "var(--k-err-bg)",   color: "var(--k-err-color)" } },
};

const typeIcons = {
  invoice: Receipt,
  receipt: Receipt,
  photo: Image,
  blueprint: FileText,
  contract: File,
  other: FileText
};

const TYPE_LABELS = {
  kitchen: 'Kuchnia', bathroom: 'Łazienka', living_room: 'Salon',
  bedroom: 'Sypialnia', outdoor: 'Ogród/Zewnątrz', whole_house: 'Cały dom',
  basement: 'Piwnica', attic: 'Strych', other: 'Inne'
};

const categoryLabels = {
  materials:  "Materiały",
  labor:      "Robocizna",
  permits:    "Pozwolenia",
  appliances: "Sprzęt AGD",
  fixtures:   "Armatura",
  tools:      "Narzędzia",
  utilities:  "Media",
  insurance:  "Ubezpieczenie",
  other:      "Inne",
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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [members, setMembers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newTaskText, setNewTaskText] = useState("");
  const [addingTask, setAddingTask] = useState(false);

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

        const [docsData, membersData, notesData] = await Promise.all([
          Document.filter({ project_id: projectId }),
          ProjectMember.filter({ project_id: projectId }),
          Note.filter({ project_id: projectId })
        ]);

        setDocuments(docsData);
        setMembers(membersData);
        setTasks(notesData);
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

  const handleAddTask = async () => {
    if (!newTaskText.trim()) return;
    setAddingTask(true);
    try {
      await Note.create({ project_id: projectId, content: newTaskText.trim(), note_type: 'text' });
      setNewTaskText("");
      await loadProjectData();
    } catch (e) {
      toast.error("Nie udało się dodać zadania.");
    }
    setAddingTask(false);
  };

  const handleToggleTask = async (task) => {
    try {
      await Note.update(task.id, { title: task.title === 'done' ? '' : 'done' });
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, title: t.title === 'done' ? '' : 'done' } : t));
    } catch (e) {
      toast.error("Nie udało się zaktualizować zadania.");
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await Note.delete(taskId);
      setTasks(prev => prev.filter(t => t.id !== taskId));
    } catch (e) {
      toast.error("Nie udało się usunąć zadania.");
    }
  };

  const handleEditSubmit = async (projectData) => {
    const clean = {
      ...projectData,
      start_date: projectData.start_date || null,
      target_completion: projectData.target_completion || null,
      budget: projectData.budget || null,
    };
    try {
      await Project.update(projectId, clean);
      setShowEditForm(false);
      await loadProjectData();
      toast.success('Projekt zaktualizowany');
    } catch (error) {
      toast.error(`Błąd: ${error.message}`);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await Project.delete(projectId);
      toast.success('Projekt usunięty');
      navigate(createPageUrl('Projects'));
    } catch (error) {
      toast.error('Coś poszło nie tak. Spróbuj ponownie.');
    }
  };

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
          <h2 className="text-xl font-medium text-black">Projekt nie znaleziony</h2>
          <Link to={createPageUrl('Projects')}>
            <Button className="mt-4 btn-primary">
              Wróć do projektów
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
            onClick={() => navigate(createPageUrl("Projects"))}
            className="hover:bg-gray-100 text-black"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-semibold text-black tracking-tight">
              {project.name}
            </h1>
            <p className="text-gray-500 mt-1">
              {TYPE_LABELS[project.type] || project.type?.replace(/_/g, ' ')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge style={statusConfig[project.status]?.style} className="border-0 font-medium hidden sm:block">
              {statusConfig[project.status]?.label}
            </Badge>
            <Button variant="ghost" size="icon" className="w-9 h-9 rounded-full text-black" onClick={() => setShowEditForm(true)}>
              <Edit className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="w-9 h-9 rounded-full" style={{ color: "var(--k-err-color)" }} onClick={() => setShowDeleteConfirm(true)}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Project Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="apple-blur apple-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="icon-box w-10 h-10 rounded-xl flex items-center justify-center">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Data rozpoczęcia</p>
                  <p className="font-medium text-black">
                    {project.start_date ? format(new Date(project.start_date), 'dd.MM.yyyy') : 'Nie ustawiono'}
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
                  <p className="text-xs text-gray-500">Budżet</p>
                  <p className="font-medium text-black">
                    {actualCost.toLocaleString('pl-PL')} zł / {(project.budget || 0).toLocaleString('pl-PL')} zł
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
                  <p className="text-xs text-gray-500">Zespół</p>
                  <p className="font-medium text-black">
                    {(() => { const n = members.length + 1; return n === 1 ? '1 osoba' : n < 5 ? `${n} osoby` : `${n} osób`; })()}
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
                  <p className="text-xs text-gray-500">Dokumenty</p>
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
                <h3 className="font-medium text-black">Realizacja budżetu</h3>
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
        <Tabs defaultValue="finanse" className="space-y-6">
          <TabsList className="apple-blur">
            <TabsTrigger value="finanse" className="text-black data-[state=active]:text-black">Finanse</TabsTrigger>
            <TabsTrigger value="harmonogram" className="text-black data-[state=active]:text-black">Harmonogram</TabsTrigger>
            <TabsTrigger value="galeria" className="text-black data-[state=active]:text-black">Galeria i Pliki</TabsTrigger>
            <TabsTrigger value="team" className="text-black data-[state=active]:text-black">Zespół ({members.length + 1})</TabsTrigger>
          </TabsList>

          {/* === FINANSE === */}
          <TabsContent value="finanse">
            <Card className="apple-blur apple-shadow">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-black">Wydatki projektu</CardTitle>
                <Link to={createPageUrl("Upload")}>
                  <Button size="sm" className="btn-primary">
                    <Plus className="w-4 h-4 mr-1" />
                    Dodaj dokument
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {documents.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="font-medium text-black mb-2">Brak dokumentów</h3>
                    <p className="text-gray-500 mb-4">Dodaj pierwszy dokument do projektu</p>
                    <Link to={createPageUrl("Upload")}>
                      <Button className="btn-primary">Dodaj dokument</Button>
                    </Link>
                  </div>
                ) : (() => {
                  // Group by category
                  const groups = {};
                  documents.forEach(doc => {
                    const cat = doc.category || 'other';
                    if (!groups[cat]) groups[cat] = [];
                    groups[cat].push(doc);
                  });
                  const grandTotal = documents.reduce((s, d) => s + (d.amount || 0), 0);

                  return (
                    <div className="space-y-6">
                      {Object.entries(groups).map(([cat, docs]) => {
                        const catTotal = docs.reduce((s, d) => s + (d.amount || 0), 0);
                        return (
                          <div key={cat}>
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-black text-sm">
                                {categoryLabels[cat] || cat}
                              </h4>
                              <span className="text-sm font-semibold" style={{ color: "var(--k-accent-dark)" }}>
                                {catTotal.toLocaleString('pl-PL')} zł
                              </span>
                            </div>
                            <div className="space-y-2">
                              {docs.map(doc => {
                                const TypeIcon = typeIcons[doc.type] || FileText;
                                return (
                                  <div key={doc.id} className="flex items-center gap-3 p-3 rounded-lg bg-white border">
                                    <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                      <TypeIcon className="w-4 h-4 text-gray-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="font-medium text-black text-sm truncate">{doc.title}</p>
                                      <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                                        {doc.vendor && <span>{doc.vendor}</span>}
                                        {doc.date && <span>{format(new Date(doc.date), 'dd.MM.yyyy')}</span>}
                                      </div>
                                    </div>
                                    {doc.amount != null && (
                                      <span className="text-sm font-medium text-green-600 flex-shrink-0">
                                        {doc.amount.toLocaleString('pl-PL')} zł
                                      </span>
                                    )}
                                    {doc.file_url && (
                                      <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-500 flex-shrink-0">
                                        <ExternalLink className="w-4 h-4" />
                                      </a>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                      {/* Grand total */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        <span className="font-semibold text-black">Suma wydatków</span>
                        <span className="font-bold text-lg" style={{ color: grandTotal > (project.budget || 0) && project.budget > 0 ? "var(--k-err-color)" : "var(--k-accent-dark)" }}>
                          {grandTotal.toLocaleString('pl-PL')} zł
                        </span>
                      </div>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          </TabsContent>

          {/* === HARMONOGRAM === */}
          <TabsContent value="harmonogram">
            <Card className="apple-blur apple-shadow">
              <CardHeader>
                <CardTitle className="text-black">Harmonogram zadań</CardTitle>
              </CardHeader>
              <CardContent>
                {tasks.length === 0 && (
                  <div className="text-center py-8 mb-4">
                    <CheckSquare className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">Brak zadań. Dodaj pierwsze zadanie.</p>
                  </div>
                )}
                {tasks.length > 0 && (
                  <div className="space-y-2 mb-4">
                    {tasks.map(task => {
                      const done = task.title === 'done';
                      return (
                        <div key={task.id} className="flex items-center gap-3 p-3 rounded-lg bg-white border group">
                          <button onClick={() => handleToggleTask(task)} className="flex-shrink-0">
                            {done
                              ? <CheckSquare className="w-5 h-5" style={{ color: "var(--k-ok-color)" }} />
                              : <Square className="w-5 h-5 text-gray-300" />
                            }
                          </button>
                          <span className={`flex-1 text-sm ${done ? 'line-through text-gray-400' : 'text-black'}`}>
                            {task.content}
                          </span>
                          {task.created_date && (
                            <span className="text-xs text-gray-400 flex-shrink-0">
                              {format(new Date(task.created_date), 'd MMM', { locale: pl })}
                            </span>
                          )}
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-gray-300 hover:text-red-500"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
                {/* Add task */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Dodaj zadanie..."
                    value={newTaskText}
                    onChange={e => setNewTaskText(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAddTask()}
                    className="flex-1"
                  />
                  <Button onClick={handleAddTask} disabled={addingTask || !newTaskText.trim()} size="sm" className="btn-primary">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* === GALERIA I PLIKI === */}
          <TabsContent value="galeria">
            <div className="space-y-6">
              {/* Zdjęcia */}
              {(() => {
                const photos = documents.filter(d => d.type === 'photo');
                const files = documents.filter(d => d.type !== 'photo');
                return (
                  <>
                    <Card className="apple-blur apple-shadow">
                      <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-black">Zdjęcia ({photos.length})</CardTitle>
                        <Link to={createPageUrl("Upload")}>
                          <Button size="sm" variant="outline">
                            <Plus className="w-4 h-4 mr-1" />
                            Dodaj zdjęcie
                          </Button>
                        </Link>
                      </CardHeader>
                      <CardContent>
                        {photos.length === 0 ? (
                          <div className="text-center py-8">
                            <Image className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500 text-sm">Brak zdjęć w tym projekcie</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {photos.map(photo => (
                              <a
                                key={photo.id}
                                href={photo.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="aspect-square rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center hover:opacity-90 transition-opacity"
                              >
                                {photo.file_url ? (
                                  <img src={photo.file_url} alt={photo.title} className="w-full h-full object-cover" />
                                ) : (
                                  <Image className="w-8 h-8 text-gray-300" />
                                )}
                              </a>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <Card className="apple-blur apple-shadow">
                      <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-black">Pliki ({files.length})</CardTitle>
                        <Link to={createPageUrl("Upload")}>
                          <Button size="sm" variant="outline">
                            <Plus className="w-4 h-4 mr-1" />
                            Dodaj plik
                          </Button>
                        </Link>
                      </CardHeader>
                      <CardContent>
                        {files.length === 0 ? (
                          <div className="text-center py-8">
                            <File className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500 text-sm">Brak plików w tym projekcie</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {files.map(doc => {
                              const TypeIcon = typeIcons[doc.type] || FileText;
                              return (
                                <div key={doc.id} className="flex items-center gap-3 p-3 rounded-lg bg-white border">
                                  <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <TypeIcon className="w-4 h-4 text-gray-400" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-black text-sm truncate">{doc.title}</p>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                      {doc.type} • {doc.date ? format(new Date(doc.date), 'dd.MM.yyyy') : '—'}
                                    </p>
                                  </div>
                                  {doc.file_url && (
                                    <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-500">
                                      <ExternalLink className="w-4 h-4" />
                                    </a>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </>
                );
              })()}
            </div>
          </TabsContent>

          {/* === ZESPÓŁ === */}
          <TabsContent value="team">
            <Card className="apple-blur apple-shadow">
              <CardHeader>
                <CardTitle className="text-black">Członkowie zespołu</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 rounded-lg bg-white border">
                    <div className="icon-box w-10 h-10 rounded-full flex items-center justify-center">
                      <Crown className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-black">
                        {project.created_by === currentUser?.email ? 'Ty' : project.created_by}
                      </h4>
                      <p className="text-sm text-gray-500">Właściciel projektu</p>
                    </div>
                    <Badge style={{ backgroundColor: "var(--k-icon-bg)", color: "var(--k-icon-color)" }}>Właściciel</Badge>
                  </div>
                  {members.map((member) => {
                    const RoleIcon = roleIcons[member.role];
                    return (
                      <div key={member.id} className="flex items-center gap-4 p-4 rounded-lg bg-white border">
                        <div className="icon-box w-10 h-10 rounded-full flex items-center justify-center">
                          <RoleIcon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-black">
                            {member.user_email === currentUser?.email ? 'Ty' : member.user_email}
                          </h4>
                          <p className="text-sm text-gray-500">Zaproszony przez {member.invited_by}</p>
                        </div>
                        <Badge style={{ backgroundColor: "var(--k-icon-bg)", color: "var(--k-icon-color)" }}>
                          {member.role === 'editor' ? 'Edytor' : member.role === 'viewer' ? 'Obserwator' : member.role}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <ProjectForm
        isOpen={showEditForm}
        onClose={() => setShowEditForm(false)}
        onSubmit={handleEditSubmit}
        project={project}
      />
      <DeleteConfirmationDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteConfirm}
        projectName={project?.name}
      />
    </div>
  );
}