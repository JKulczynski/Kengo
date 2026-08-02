import React from 'react';
import { useTranslation } from 'react-i18next';
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

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
};

export default function SearchResultItem({ item, type }) {
  const { t } = useTranslation();

  const statusConfig = {
    planning:    { icon: PlayCircle,  label: t("common.projectStatus.planning"),    style: { backgroundColor: "var(--k-icon-bg)",  color: "var(--k-icon-color)" } },
    in_progress: { icon: PlayCircle,  label: t("common.projectStatus.in_progress"), style: { backgroundColor: "var(--k-warn-bg)",  color: "var(--k-warn-color)" } },
    completed:   { icon: CheckCircle, label: t("common.projectStatus.completed"),   style: { backgroundColor: "var(--k-ok-bg)",    color: "var(--k-ok-color)" } },
  };

  const Icon = type === 'project' ? Folder : (docIcons[item.type] || FileText);
  const StatusIcon = item.status ? statusConfig[item.status]?.icon || PlayCircle : null;
  const statusStyle = item.status ? statusConfig[item.status]?.style : {};

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
                <Badge style={statusStyle} className="border-0 text-xs font-medium">
                  {StatusIcon && React.createElement(StatusIcon, { className: 'w-3 h-3 mr-1' })}
                  {statusConfig[item.status]?.label ?? item.status?.replace(/_/g, ' ') ?? ''}
                </Badge>
              ) : (
                <>
                  <Badge variant="outline" className="text-xs capitalize">{t(`common.documentTypes.${item.type}`, item.type)}</Badge>
                  {item.amount && <span className="text-xs text-green-600 font-medium">{item.amount.toLocaleString('pl-PL')} zł</span>}
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