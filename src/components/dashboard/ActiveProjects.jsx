
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
    Plus,
    ArrowUpRight
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const statusConfig = {
  planning: { color: "bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400", label: "Planning" },
  in_progress: { color: "bg-orange-50 dark:bg-orange-950 text-orange-600 dark:text-orange-400", label: "In Progress" },
  on_hold: { color: "bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400", label: "On Hold" },
  completed: { color: "bg-green-50 dark:bg-green-950 text-green-600 dark:text-green-400", label: "Completed" }
};

export default function ActiveProjects({ projects, documents, isLoading, onProjectUpdate }) {
  if (isLoading) {
    return (
      <div className="apple-blur rounded-2xl p-8 apple-shadow">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-semibold text-black">Projects</h2>
        </div>
        <div className="space-y-6">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-2 w-32" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="apple-blur rounded-2xl p-6 md:p-8 apple-shadow">
      <div className="flex justify-between items-center mb-6 md:mb-8">
        <h2 className="text-xl font-semibold text-black tracking-tight">Projects</h2>
        <Link to={createPageUrl("Projects")}>
          <Button variant="ghost" size="sm" className="text-gray-500 hover:text-black">
            <ArrowUpRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-12 md:py-16">
          <div className="w-12 h-12 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <Plus className="w-6 h-6 text-gray-400" />
          </div>
          <h3 className="font-medium text-black mb-2">No projects yet</h3>
          <p className="text-gray-500 text-sm mb-6">Start your first renovation project</p>
          <Link to={createPageUrl("Projects")}>
            <Button className="bg-black text-white hover:bg-gray-800">
              Create Project
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-6 md:space-y-8">
          {projects.map((project) => {
            const projectDocs = documents ? documents.filter(d => d.project_id === project.id) : [];
            const actualCost = projectDocs.reduce((sum, doc) => sum + (doc.amount || 0), 0);
            const budgetUsage = project.budget > 0 ? (actualCost / project.budget) * 100 : 0;
            
            let budgetColor = 'bg-green-500';
            if (budgetUsage > 75) budgetColor = 'bg-orange-500';
            if (budgetUsage > 100) budgetColor = 'bg-red-500';

            return (
              <Link 
                key={project.id} 
                to={createPageUrl(`Projects`)}
                className="block group hover:bg-gray-50 rounded-lg p-4 -m-4 transition-colors cursor-pointer"
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-medium text-black text-base md:text-lg mb-1">
                        {project.name}
                      </h3>
                      <p className="text-sm text-gray-500 capitalize">
                        {project.type.replace(/_/g, ' ')}
                      </p>
                    </div>
                    <Badge className={`${statusConfig[project.status]?.color} border-0 text-xs font-medium`}>
                      {statusConfig[project.status]?.label}
                    </Badge>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-gray-500">
                        {project.current_phase?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Planning'}
                      </span>
                      <span className="text-xs font-medium text-gray-700">
                        {project.progress_percentage || 0}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1">
                      <div 
                        className="bg-black rounded-full h-1 transition-all duration-300" 
                        style={{ width: `${project.progress_percentage || 0}%` }}
                      />
                    </div>
                  </div>
                  
                  {project.budget > 0 && (
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-gray-500">
                          Budget: ${actualCost.toLocaleString()} / ${project.budget.toLocaleString()}
                        </span>
                        <span className={`text-xs font-medium ${budgetUsage > 100 ? 'text-red-500' : 'text-gray-700'}`}>
                          {budgetUsage.toFixed(0)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1">
                        <div 
                          className={`${budgetColor} rounded-full h-1 transition-all duration-300`} 
                          style={{ width: `${Math.min(budgetUsage, 100)}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  );
}
