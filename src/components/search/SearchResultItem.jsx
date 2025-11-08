import React from 'react';
import { motion } from 'framer-motion';
import { 
    Folder, 
    FileText, 
    Receipt, 
    Image, 
    File,
    ArrowUpRight,
    CheckCircle,
    PlayCircle
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const docIcons = {
  invoice: Receipt,
  receipt: Receipt,
  photo: Image,
  blueprint: File,
  contract: File,
  other: FileText
};

const statusConfig = {
  planning: { icon: PlayCircle, color: "bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400", label: "Planning" },
  in_progress: { icon: PlayCircle, color: "bg-orange-50 dark:bg-orange-950 text-orange-600 dark:text-orange-400", label: "In Progress" },
  completed: { icon: CheckCircle, color: "bg-green-50 dark:bg-green-950 text-green-600 dark:text-green-400", label: "Completed" }
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
};

export default function SearchResultItem({ item, type }) {
  const Icon = type === 'project' ? Folder : (docIcons[item.type] || FileText);
  const StatusIcon = item.status ? statusConfig[item.status]?.icon || PlayCircle : null;
  const statusColor = item.status ? statusConfig[item.status]?.color : '';

  return (
    <motion.div variants={itemVariants}>
      <a
        href={type === 'document' ? item.file_url : '#'}
        target={type === 'document' ? '_blank' : '_self'}
        rel="noopener noreferrer"
        className="group apple-blur rounded-2xl p-4 flex items-center justify-between apple-shadow hover:apple-shadow-lg transition-all duration-300"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gray-100 dark:bg-gray-900 rounded-lg flex-shrink-0 flex items-center justify-center">
            <Icon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-black dark:text-white text-base truncate">
              {item.name || item.title}
            </p>
            <div className="flex items-center gap-2 mt-1">
              {type === 'project' ? (
                <Badge className={`${statusColor} border-0 text-xs font-medium`}>
                  {StatusIcon && React.createElement(StatusIcon, { className: 'w-3 h-3 mr-1' })}
                  {item.status.replace(/_/g, ' ')}
                </Badge>
              ) : (
                <>
                  <Badge variant="outline" className="text-xs capitalize">{item.type}</Badge>
                  {item.amount && <span className="text-xs text-green-600 font-medium">${item.amount.toLocaleString()}</span>}
                </>
              )}
            </div>
          </div>
        </div>
        <ArrowUpRight className="w-5 h-5 text-gray-300 dark:text-gray-600 group-hover:text-black dark:group-hover:text-white transition-colors" />
      </a>
    </motion.div>
  );
}