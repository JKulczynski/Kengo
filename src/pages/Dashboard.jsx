import React, { useState, useEffect } from "react";
import { Project } from "@/api/entities";
import { Document } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
    Plus, 
    Camera,
    ArrowUpRight
} from "lucide-react";

import StatsCards from "../components/dashboard/StatsCards";
import ActiveProjects from "../components/dashboard/ActiveProjects";
import RecentDocuments from "../components/dashboard/RecentDocuments";

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [projectsData, documentsData] = await Promise.all([
        Project.list('-updated_date'),
        Document.list('-created_date', 50)
      ]);
      setProjects(projectsData);
      setDocuments(documentsData);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    }
    setIsLoading(false);
  };

  const totalSpent = documents.reduce((sum, doc) => sum + (doc.amount || 0), 0);
  const activeProjects = projects.filter(p => p.status === 'in_progress').length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12">
        {/* Header */}
        <div className="mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl font-semibold text-black mb-3 tracking-tight">
            Good morning
          </h1>
          <p className="text-base md:text-lg text-gray-500 font-normal">
            Here's what's happening with your projects
          </p>
        </div>

        {/* Quick Actions - Enhanced for mobile */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8 md:mb-12">
          <Link to={createPageUrl("Upload")} className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-6 py-3 text-sm font-medium transition-colors duration-200">
              <Camera className="w-4 h-4 mr-2" />
              Scan Document
            </Button>
          </Link>
          <Link to={createPageUrl("Projects")} className="w-full sm:w-auto">
            <Button variant="outline" className="w-full sm:w-auto border-gray-200 hover:bg-gray-50 rounded-lg px-6 py-3 text-sm font-medium text-black">
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </Button>
          </Link>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-12">
          <div className="apple-blur rounded-2xl p-6 apple-shadow">
            <div className="text-2xl md:text-3xl font-semibold text-black mb-1">
              {activeProjects}
            </div>
            <div className="text-sm text-gray-500 font-normal">
              Active Projects
            </div>
          </div>
          
          <div className="apple-blur rounded-2xl p-6 apple-shadow">
            <div className="text-2xl md:text-3xl font-semibold text-black mb-1">
              ${totalSpent.toLocaleString()}
            </div>
            <div className="text-sm text-gray-500 font-normal">
              Total Spent
            </div>
          </div>
          
          <div className="apple-blur rounded-2xl p-6 apple-shadow">
            <div className="text-2xl md:text-3xl font-semibold text-black mb-1">
              {documents.length}
            </div>
            <div className="text-sm text-gray-500 font-normal">
              Documents
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
          <div className="lg:col-span-2">
            <ActiveProjects 
              projects={projects.filter(p => p.status !== 'completed')}
              documents={documents}
              isLoading={isLoading}
              onProjectUpdate={loadData}
            />
          </div>

          <div>
            <RecentDocuments 
              documents={documents.slice(0, 10)}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
}