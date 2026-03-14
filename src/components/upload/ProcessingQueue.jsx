import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
    FileText, 
    Image, 
    X, 
    Play, 
    Loader2,
    CheckCircle2,
    Zap
} from "lucide-react";
import { motion } from "framer-motion";

export default function ProcessingQueue({ files, processing, removeFile, processFile }) {
  const getFileIcon = (file) => {
    return file.type === "application/pdf" ? FileText : Image;
  };

  const formatFileSize = (bytes) => {
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
  };

  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="border-b border-slate-100">
        <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-500" />
          Kolejka do przetworzenia ({files.length})
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="space-y-4 mb-6">
          {files.map((file, index) => {
            const FileIcon = getFileIcon(file);
            const isProcessing = processing[index];
            
            return (
              <motion.div
                key={`${file.name}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`flex items-center gap-4 p-4 rounded-xl border ${
                  isProcessing 
                    ? "border-amber-200 bg-amber-50" 
                    : "border-slate-200 bg-white hover:bg-slate-50"
                } transition-all duration-200`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  file.type === "application/pdf" ? "bg-red-100" : "bg-blue-100"
                }`}>
                  <FileIcon className={`w-6 h-6 ${
                    file.type === "application/pdf" ? "text-red-600" : "text-blue-600"
                  }`} />
                </div>
                
                <div className="flex-1">
                  <p className="font-semibold text-slate-900">{file.name}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-sm text-slate-500">
                      {formatFileSize(file.size)}
                    </span>
                    <Badge
                      variant="outline"
                      className="text-xs"
                      style={file.type === "application/pdf"
                        ? { backgroundColor: "var(--k-err-bg)", color: "var(--k-err-color)", borderColor: "var(--k-border-md)" }
                        : { backgroundColor: "var(--k-icon-bg)", color: "var(--k-icon-color)", borderColor: "var(--k-border-md)" }
                      }
                    >
                      {file.type === "application/pdf" ? "PDF" : "Obraz"}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {isProcessing ? (
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-800">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span className="text-xs font-medium">Analizuję...</span>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => processFile(file, index)}
                      disabled={processing.some(p => p)}
                      className="renovation-gradient text-xs"
                    >
                      <Play className="w-3 h-3 mr-1" />
                      Analizuj
                    </Button>
                  )}
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFile(index)}
                    disabled={isProcessing}
                    className="w-8 h-8 text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>

        <Button
          onClick={() => processFile(files[0], 0)}
          disabled={files.length === 0 || processing.some(p => p)}
          className="w-full renovation-gradient shadow-lg hover:shadow-xl transition-all duration-300"
          size="lg"
        >
          {processing.some(p => p) ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              AI analizuje...
            </>
          ) : (
            <>
              <Zap className="w-5 h-5 mr-2" />
              Analizuj następny dokument
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}