import React, { useState, useEffect, useMemo } from "react";
import { Document } from "@/api/entities";
import { Project } from "@/api/entities";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
    FileText, 
    Receipt, 
    Image, 
    File,
    Search,
    Filter,
    Upload,
    ExternalLink,
    MoreVertical,
    Trash2
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import DeleteConfirmationDialog from "../components/documents/DeleteConfirmationDialog";

const typeIcons = {
  invoice: Receipt,
  receipt: Receipt,
  photo: Image,
  blueprint: FileText,
  contract: File,
  warranty: FileText,
  manual: FileText,
  estimate: FileText,
  permit: FileText,
  other: FileText
};

const categoryColors = {
  materials: "bg-blue-100 text-blue-800",
  labor: "bg-green-100 text-green-800",
  permits: "bg-purple-100 text-purple-800",
  appliances: "bg-orange-100 text-orange-800",
  fixtures: "bg-pink-100 text-pink-800",
  tools: "bg-gray-100 text-gray-800",
  utilities: "bg-yellow-100 text-yellow-800",
  insurance: "bg-red-100 text-red-800",
  other: "bg-gray-100 text-gray-800"
};

export default function DocumentsPage() {
  const [documents, setDocuments] = useState([]);
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [projectFilter, setProjectFilter] = useState("all");
  const [documentToDelete, setDocumentToDelete] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const filteredDocuments = useMemo(() => {
    let filtered = documents;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(doc => 
        doc.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.vendor?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.notes?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter(doc => doc.type === typeFilter);
    }

    // Category filter  
    if (categoryFilter !== "all") {
      filtered = filtered.filter(doc => doc.category === categoryFilter);
    }

    // Project filter
    if (projectFilter !== "all") {
      filtered = filtered.filter(doc => doc.project_id === projectFilter);
    }

    return filtered;
  }, [documents, searchQuery, typeFilter, categoryFilter, projectFilter]);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [documentsData, projectsData] = await Promise.all([
        Document.list('-created_date'),
        Project.list()
      ]);
      setDocuments(documentsData);
      setProjects(projectsData);
    } catch (error) {
      console.error("Error loading documents:", error);
      setError("Nie udało się załadować dokumentów.");
    }
    setIsLoading(false);
  };

  const getProjectName = (projectId) => {
    return projects.find(p => p.id === projectId)?.name || 'No Project';
  };

  const clearFilters = () => {
    setSearchQuery("");
    setTypeFilter("all");
    setCategoryFilter("all"); 
    setProjectFilter("all");
  };

  const handleDeleteConfirm = async () => {
    if (documentToDelete) {
      try {
        await Document.delete(documentToDelete.id);
        setDocumentToDelete(null); // Close the dialog
        await loadData(); // Reload documents after deletion
      } catch (error) {
        console.error("Error deleting document:", error);
        // Optionally, show a toast or error message to the user
      }
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-6 py-12">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
            <div>
              <h1 className="text-4xl font-semibold text-black tracking-tight">
                Wszystkie dokumenty
              </h1>
              <p className="text-lg text-gray-500 font-normal mt-2">
                Przeglądaj i zarządzaj dokumentami remontowymi
              </p>
            </div>
            <Link to={createPageUrl("Upload")}>
              <Button className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium">
                <Upload className="w-4 h-4 mr-2" />
                Dodaj dokument
              </Button>
            </Link>
          </div>

          {/* Filters */}
          <div className="apple-blur rounded-2xl p-6 apple-shadow mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Szukaj dokumentów..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Wszystkie typy" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Wszystkie typy</SelectItem>
                  <SelectItem value="invoice">Faktura</SelectItem>
                  <SelectItem value="receipt">Paragon</SelectItem>
                  <SelectItem value="contract">Umowa</SelectItem>
                  <SelectItem value="permit">Pozwolenie</SelectItem>
                  <SelectItem value="warranty">Gwarancja</SelectItem>
                  <SelectItem value="photo">Zdjęcie</SelectItem>
                  <SelectItem value="other">Inne</SelectItem>
                </SelectContent>
              </Select>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Wszystkie kategorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Wszystkie kategorie</SelectItem>
                  <SelectItem value="materials">Materiały</SelectItem>
                  <SelectItem value="labor">Robocizna</SelectItem>
                  <SelectItem value="permits">Pozwolenia</SelectItem>
                  <SelectItem value="appliances">Sprzęt AGD</SelectItem>
                  <SelectItem value="fixtures">Armatura</SelectItem>
                  <SelectItem value="tools">Narzędzia</SelectItem>
                  <SelectItem value="utilities">Media</SelectItem>
                  <SelectItem value="insurance">Ubezpieczenie</SelectItem>
                  <SelectItem value="other">Inne</SelectItem>
                </SelectContent>
              </Select>

              <Select value={projectFilter} onValueChange={setProjectFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Wszystkie projekty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Wszystkie projekty</SelectItem>
                  {projects.map(project => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-500">
                {filteredDocuments.length} z {documents.length} dokumentów
              </p>
              <Button variant="outline" onClick={clearFilters} size="sm">
                Wyczyść filtry
              </Button>
            </div>
          </div>

          {error && (
            <div className="mb-8 p-4 bg-red-50 rounded-xl border border-red-100 flex items-center justify-between">
              <p className="text-red-600 text-sm">{error}</p>
              <Button size="sm" variant="outline" onClick={loadData} className="ml-4 text-sm">
                Spróbuj ponownie
              </Button>
            </div>
          )}

          {/* Documents List */}
          {isLoading ? (
            <div className="grid gap-6">
              {Array(5).fill(0).map((_, i) => (
                <div key={i} className="apple-blur rounded-2xl p-6">
                  <Skeleton className="h-6 w-1/3 mb-4" />
                  <Skeleton className="h-4 w-1/2 mb-2" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
              ))}
            </div>
          ) : filteredDocuments.length > 0 ? (
            <div className="grid gap-6">
              {filteredDocuments.map((doc) => {
                const TypeIcon = typeIcons[doc.type] || FileText;
                
                return (
                  <div key={doc.id} className="apple-blur rounded-2xl p-6 apple-shadow hover:apple-shadow-lg transition-shadow duration-300">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                          <TypeIcon className="w-6 h-6 text-gray-500" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg text-black mb-2">
                            {doc.title}
                          </h3>
                          
                          <div className="flex flex-wrap gap-2 mb-3">
                            <Badge variant="outline" className="text-xs">
                              {doc.type?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </Badge>
                            <Badge className={`text-xs ${categoryColors[doc.category] || categoryColors.other}`}>
                              {doc.category?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </Badge>
                            {doc.project_id && (
                              <Badge variant="outline" className="text-xs">
                                {getProjectName(doc.project_id)}
                              </Badge>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                            {doc.vendor && (
                              <div>
                                <span className="block text-xs text-gray-500">Dostawca</span>
                                <span className="font-medium text-black">{doc.vendor}</span>
                              </div>
                            )}
                            {doc.amount && (
                              <div>
                                <span className="block text-xs text-gray-500">Kwota</span>
                                <span className="font-medium text-green-600">
                                  ${doc.amount.toLocaleString()}
                                </span>
                              </div>
                            )}
                            {doc.date && (
                              <div>
                                <span className="block text-xs text-gray-500">Data</span>
                                <span className="font-medium text-black">
                                  {format(new Date(doc.date), 'MMM d, yyyy')}
                                </span>
                              </div>
                            )}
                            <div>
                              <span className="block text-xs text-gray-500">Dodano</span>
                              <span className="font-medium text-black">
                                {format(new Date(doc.created_date), 'MMM d, yyyy')}
                              </span>
                            </div>
                          </div>
                          
                          {doc.notes && (
                            <p className="text-sm text-gray-600 mt-3">
                              {doc.notes}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <a 
                          href={doc.file_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Otwórz
                        </a>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="apple-blur">
                            <DropdownMenuItem onClick={() => setDocumentToDelete(doc)} className="text-red-500">
                              <Trash2 className="w-4 h-4 mr-2" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-24 apple-blur rounded-2xl">
              <div className="w-16 h-16 mx-auto mb-6 bg-gray-100 rounded-2xl flex items-center justify-center">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-medium text-black mb-2">
                {documents.length === 0 ? "Brak dokumentów" : "Brak wyników"}
              </h3>
              <p className="text-gray-500 mb-6">
                {documents.length === 0
                  ? "Wgraj pierwszy dokument, aby zacząć."
                  : "Brak wyników dla wybranych filtrów. Wyczyść filtry."}
              </p>
              {documents.length === 0 ? (
                <Link to={createPageUrl("Upload")}>
                  <Button className="bg-blue-500 hover:bg-blue-600 text-white">
                    <Upload className="w-4 h-4 mr-2" />
                    Dodaj dokument
                  </Button>
                </Link>
              ) : (
                <Button variant="outline" onClick={clearFilters}>
                  Wyczyść filtry
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
      <DeleteConfirmationDialog 
        isOpen={!!documentToDelete}
        onClose={() => setDocumentToDelete(null)}
        onConfirm={handleDeleteConfirm}
        documentTitle={documentToDelete?.title}
      />
    </>
  );
}