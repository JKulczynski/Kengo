import React, { useState, useCallback, useRef } from "react";
import { Document } from "@/api/entities";
import { Project } from "@/api/entities";
import { ExtractDataFromUploadedFile, UploadFile, InvokeLLM } from "@/api/integrations";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { toast } from "sonner";

import FileUploadZone from "../components/upload/FileUploadZone";
import ProcessingQueue from "../components/upload/ProcessingQueue";
import DocumentPreview from "../components/upload/DocumentPreview";

export default function UploadPage() {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [projects, setProjects] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState([]);
  const [currentPreview, setCurrentPreview] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  React.useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const projectsData = await Project.list('-updated_date');
      setProjects(projectsData);
    } catch (error) {
      console.error("Error loading projects:", error);
    }
  };

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFiles = Array.from(e.dataTransfer.files).filter(
      file => file.type === "application/pdf" || file.type.startsWith("image/")
    );

    if (droppedFiles.length === 0) {
      setError("Wgraj pliki PDF lub obrazy");
      return;
    }

    addFiles(droppedFiles);
  }, []);

  const handleFileInput = (e) => {
    const selectedFiles = Array.from(e.target.files).filter(
      file => file.type === "application/pdf" || file.type.startsWith("image/")
    );

    if (selectedFiles.length === 0) {
      setError("Wgraj pliki PDF lub obrazy");
      return;
    }

    addFiles(selectedFiles);
  };

  const handleCameraCapture = (file) => {
    const index = files.length;
    addFiles([file]);
    setTimeout(() => processFile(file, index), 100);
  };

  const addFiles = (newFiles) => {
    setFiles(prev => [...prev, ...newFiles]);
    setProcessing(prev => [...prev, ...Array(newFiles.length).fill(false)]);
    setError(null);
  };

  const removeFile = (indexToRemove) => {
    setFiles(prev => prev.filter((_, index) => index !== indexToRemove));
    setProcessing(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const processFile = async (file, index) => {
    setProcessing(prev => {
      const newProcessing = [...prev];
      newProcessing[index] = true;
      return newProcessing;
    });

    try {
      const { file_url } = await UploadFile({ file });
      
      const aiResult = await InvokeLLM({
        prompt: `Analyze this document and extract key information. Determine if it's an invoice, receipt, contract, permit, or other document type. Extract vendor name, amount, date, and any relevant renovation-related details. Also suggest which renovation phase this might relate to.`,
        file_urls: [file_url],
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            type: { 
              type: "string",
              enum: ["invoice", "receipt", "contract", "permit", "blueprint", "photo", "warranty", "manual", "estimate", "other"]
            },
            category: {
              type: "string", 
              enum: ["materials", "labor", "permits", "appliances", "fixtures", "tools", "utilities", "insurance", "other"]
            },
            vendor: { type: "string" },
            amount: { type: "number" },
            date: { type: "string" },
            phase: {
              type: "string",
              enum: ["design", "permits", "demolition", "structural", "electrical", "plumbing", "insulation", "drywall", "flooring", "painting", "fixtures", "final_touches"]
            },
            tags: { 
              type: "array",
              items: { type: "string" }
            },
            notes: { type: "string" }
          }
        }
      });
      
      setCurrentPreview({
        ...aiResult,
        file_url,
        file_name: file.name,
        ai_extracted_data: aiResult
      });
      
    } catch (error) {
      setError(`Błąd przetwarzania ${file.name}: ${error.message}`);
      removeFile(index);
    }

    setProcessing(prev => {
      const newProcessing = [...prev];
      newProcessing[index] = false;
      return newProcessing;
    });
  };

  const handleSaveDocument = async (documentData) => {
    setIsProcessing(true);
    try {
      await Document.create({
        ...documentData,
        project_id: documentData.project_id || null,
        amount: documentData.amount || null,
        date: documentData.date || null,
        warranty_end_date: documentData.warranty_end_date || null,
      });
      const fileIndex = files.findIndex(f => f.name === currentPreview.file_name);
      if (fileIndex !== -1) {
        removeFile(fileIndex);
      }
      setCurrentPreview(null);
      toast.success("Dokument został zapisany");
      if (files.length <= 1) {
        navigate(createPageUrl("Dashboard"));
      }
    } catch (error) {
      setError("Błąd zapisu dokumentu. Spróbuj ponownie.");
    }
    setIsProcessing(false);
  };

  const cancelPreview = () => {
    const fileIndex = files.findIndex(f => f.name === currentPreview.file_name);
    if (fileIndex !== -1) {
      removeFile(fileIndex);
    }
    setCurrentPreview(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center gap-4 mb-12">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(createPageUrl("Dashboard"))}
            className="hover:bg-gray-100"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-semibold text-black tracking-tight">Dodaj dokument</h1>
            <p className="text-gray-500 mt-1">Dodaj dokumenty do swoich projektów remontowych</p>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-8 apple-blur rounded-xl">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-8">
          {!currentPreview && (
            <>
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <FileUploadZone 
                  onFileSelect={handleFileInput}
                  onCameraCapture={handleCameraCapture}
                  dragActive={dragActive}
                />
              </div>

              {files.length > 0 && (
                <ProcessingQueue
                  files={files}
                  processing={processing}
                  removeFile={removeFile}
                  processFile={processFile}
                />
              )}
            </>
          )}

          {currentPreview && (
            <DocumentPreview
              extractedData={currentPreview}
              projects={projects}
              onSave={handleSaveDocument}
              onCancel={cancelPreview}
              isProcessing={isProcessing}
            />
          )}
        </div>
      </div>
    </div>
  );
}