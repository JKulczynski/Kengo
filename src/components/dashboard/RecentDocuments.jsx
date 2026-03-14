
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
    FileText, 
    Receipt, 
    Image, 
    File,
    ArrowUpRight,
    Upload
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { pl } from "date-fns/locale";

const typeIcons = {
  invoice: Receipt,
  receipt: Receipt,
  photo: Image,
  blueprint: FileText,
  contract: File,
  other: FileText
};

export default function RecentDocuments({ documents, isLoading }) {
  if (isLoading) {
    return (
      <div className="apple-blur rounded-2xl p-6 apple-shadow">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-medium text-black">Dokumenty</h3>
        </div>
        <div className="space-y-4">
          {Array(5).fill(0).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="w-8 h-8 rounded-lg" />
              <div className="flex-1">
                <Skeleton className="h-4 w-32 mb-1" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="apple-blur rounded-2xl p-6 apple-shadow">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-medium text-black">Dokumenty</h3>
        <Link 
          to={createPageUrl("Documents")}
          className="text-gray-500 hover:text-black transition-colors"
        >
          <ArrowUpRight className="w-4 h-4" />
        </Link>
      </div>

      {documents.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-8 h-8 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Brak dokumentów</p>
        </div>
      ) : (
        <Link to={createPageUrl("Documents")}>
          <div className="space-y-3 hover:bg-gray-50 rounded-lg p-2 -m-2 transition-colors cursor-pointer">
            {documents.slice(0, 6).map((doc) => {
              const TypeIcon = typeIcons[doc.type] || FileText;
              
              return (
                <div key={doc.id} className="group flex items-center gap-3 p-2 -m-2 rounded-lg">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <TypeIcon className="w-4 h-4 text-gray-500" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-black text-sm truncate">
                      {doc.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {doc.amount && (
                        <span className="text-xs text-green-600 font-medium">
                          ${doc.amount.toLocaleString()}
                        </span>
                      )}
                      <span className="text-xs text-gray-500">
                        {format(new Date(doc.created_date), 'd MMM', { locale: pl })}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Link>
      )}
    </div>
  );
}
