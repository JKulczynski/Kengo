import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
    MoreHorizontal,
    Edit,
    Trash2,
    Clock,
    PlayCircle,
    PauseCircle,
    CheckCircle
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion } from "framer-motion";

const TYPE_LABELS = {
  kitchen: 'Kuchnia', bathroom: 'Łazienka', living_room: 'Salon',
  bedroom: 'Sypialnia', outdoor: 'Ogród/Zewnątrz', whole_house: 'Cały dom',
  basement: 'Piwnica', attic: 'Strych', other: 'Inne'
};

const statusConfig = {
  planning:    { icon: Clock,        label: "Planowanie", style: { backgroundColor: "var(--k-icon-bg)",  color: "var(--k-icon-color)" } },
  in_progress: { icon: PlayCircle,   label: "W trakcie",  style: { backgroundColor: "var(--k-warn-bg)",  color: "var(--k-warn-color)" } },
  on_hold:     { icon: PauseCircle,  label: "Wstrzymany", style: { backgroundColor: "var(--k-err-bg)",   color: "var(--k-err-color)" } },
  completed:   { icon: CheckCircle,  label: "Ukończony",  style: { backgroundColor: "var(--k-ok-bg)",    color: "var(--k-ok-color)" } },
};


const BudgetTracker = ({ budget, actualCost }) => {
  if (!budget || budget <= 0) return null;

  const cost = actualCost || 0;
  const budgetUsage = (cost / budget) * 100;
  let budgetColor = 'bg-green-500';
  if (budgetUsage > 75) budgetColor = 'bg-orange-500';
  if (budgetUsage > 100) budgetColor = 'bg-red-500';

  return (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-gray-500">Budżet</span>
        <span className={`text-xs font-medium ${budgetUsage > 100 ? 'text-red-500' : 'text-black'}`}>
          {cost.toLocaleString('pl-PL')} zł / {budget.toLocaleString('pl-PL')} zł
        </span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-1.5">
        <div 
          className={`${budgetColor} rounded-full h-1.5`} 
          style={{ width: `${Math.min(budgetUsage, 100)}%` }}
        />
      </div>
    </div>
  );
};

const GridView = ({ project, onEdit, onDelete }) => (
  <div className="apple-blur rounded-2xl p-6 h-full flex flex-col justify-between apple-shadow hover:apple-shadow-lg transition-shadow duration-300">
    <div>
      <div className="flex justify-between items-start mb-4">
        <div className="icon-box w-10 h-10 rounded-lg flex items-center justify-center font-semibold text-base">
          {project.name.charAt(0)}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="apple-blur">
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(project); }}>
              <Edit className="w-4 h-4 mr-2" /> Edytuj
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDelete(project); }} className="text-red-500">
              <Trash2 className="w-4 h-4 mr-2" /> Usuń
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <h3 className="font-semibold text-lg text-black mb-2">{project.name}</h3>
      <p className="text-sm text-gray-500 capitalize mb-4">{TYPE_LABELS[project.type] || project.type.replace(/_/g, ' ')}</p>
      
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs text-gray-500">Postęp</span>
        <span className="text-xs font-medium text-black">{project.progress_percentage || 0}%</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-1.5">
        <div 
          className="bg-black rounded-full h-1.5" 
          style={{ width: `${project.progress_percentage || 0}%` }}
        />
      </div>
      <BudgetTracker budget={project.budget} actualCost={project.actualCost} />
    </div>
    <div className="mt-6 flex justify-between items-center">
      <Badge style={statusConfig[project.status]?.style} className="border-0 text-xs font-medium">
        {React.createElement(statusConfig[project.status]?.icon, { className: 'w-3 h-3 mr-1' })}
        {statusConfig[project.status]?.label}
      </Badge>
    </div>
  </div>
);

const ListView = ({ project, onEdit, onDelete }) => {
  const { budget, actualCost } = project;
  const cost = actualCost || 0;
  const budgetUsage = budget && budget > 0 ? (cost / budget) * 100 : 0;
  
  return (
    <div className="apple-blur rounded-2xl p-4 flex items-center justify-between apple-shadow hover:apple-shadow-lg transition-shadow duration-300">
      <div className="flex items-center gap-4">
        <div className="icon-box w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center font-semibold text-base">
          {project.name.charAt(0)}
        </div>
        <div>
          <h3 className="font-semibold text-lg text-black">{project.name}</h3>
          <p className="text-sm text-gray-500 capitalize">{TYPE_LABELS[project.type] || project.type.replace(/_/g, ' ')}</p>
        </div>
      </div>
      <div className="hidden md:flex items-center gap-6">
        <div className="w-32">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-gray-500">Postęp</span>
            <span className="text-xs font-medium text-black">{project.progress_percentage || 0}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1.5">
            <div className="bg-black rounded-full h-1.5" style={{ width: `${project.progress_percentage || 0}%` }} />
          </div>
        </div>
        
        {budget > 0 && (
          <div className="w-32">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-500">Budżet</span>
              <span className={`text-xs font-medium ${budgetUsage > 100 ? 'text-red-500' : 'text-black'}`}>
                {budgetUsage.toFixed(0)}%
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5">
              <div 
                className={`${budgetUsage > 100 ? 'bg-red-500' : budgetUsage > 75 ? 'bg-orange-500' : 'bg-green-500'} rounded-full h-1.5`} 
                style={{ width: `${Math.min(budgetUsage, 100)}%` }} />
            </div>
          </div>
        )}
        
        <Badge style={statusConfig[project.status]?.style} className="border-0 text-xs font-medium">
          {React.createElement(statusConfig[project.status]?.icon, { className: 'w-3 h-3 mr-1' })}
          {statusConfig[project.status]?.label}
        </Badge>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="apple-blur">
          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(project); }}><Edit className="w-4 h-4 mr-2" /> Edytuj</DropdownMenuItem>
          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDelete(project); }} className="text-red-500"><Trash2 className="w-4 h-4 mr-2" /> Usuń</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default function ProjectCard({ project, onEdit, onDelete, viewMode }) {
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      transition={{ duration: 0.3 }}
      layout
    >
      {viewMode === 'grid' 
        ? <GridView project={project} onEdit={onEdit} onDelete={onDelete} />
        : <ListView project={project} onEdit={onEdit} onDelete={onDelete} />
      }
    </motion.div>
  );
}