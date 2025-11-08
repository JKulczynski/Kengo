import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
    Camera, 
    Search, 
    Zap, 
    MessageSquare,
    Plus,
    TrendingUp
} from "lucide-react";

const actions = [
  {
    title: "Smart Scan",
    description: "Upload & analyze documents instantly",
    icon: Camera,
    url: "Upload",
    color: "warm-gradient",
    textColor: "text-amber-700"
  },
  {
    title: "AI Search", 
    description: "Find anything in your projects",
    icon: Search,
    url: "Search", 
    color: "bg-gradient-to-br from-blue-500 to-blue-600",
    textColor: "text-blue-700"
  },
  {
    title: "Quick Ask",
    description: "Get renovation advice instantly", 
    icon: MessageSquare,
    url: "Search",
    color: "bg-gradient-to-br from-purple-500 to-purple-600",
    textColor: "text-purple-700"
  },
  {
    title: "New Project",
    description: "Start planning your renovation",
    icon: Plus,
    url: "Projects",
    color: "renovation-gradient", 
    textColor: "text-slate-700"
  }
];

export default function QuickActions() {
  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="border-b border-slate-100 p-4">
        <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-500" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-4">
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action) => {
            const Icon = action.icon;
            
            return (
              <Link key={action.title} to={createPageUrl(action.url)}>
                <Button 
                  variant="outline"
                  className="w-full h-auto p-4 border-slate-200 hover:border-slate-300 hover:shadow-md transition-all duration-200 flex flex-col items-center text-center gap-2"
                >
                  <div className={`w-8 h-8 ${action.color} rounded-lg flex items-center justify-center shadow-sm`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className={`font-semibold text-xs ${action.textColor}`}>
                      {action.title}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {action.description}
                    </div>
                  </div>
                </Button>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}