import React, { useState, useEffect } from 'react';
import { Document } from '@/api/entities';
import { Project } from '@/api/entities';
import { format, differenceInDays, parseISO, isValid } from 'date-fns';
import { ShieldCheck, AlertTriangle, XCircle, FileText } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from 'framer-motion';

const WarrantyCard = ({ doc, projectName }) => {
  const today = new Date();

  // Bezpieczne parsowanie daty
  const endDate = doc?.warranty_end_date ? parseISO(doc.warranty_end_date) : null;
  const hasValidEndDate = endDate && isValid(endDate);

  if (!hasValidEndDate) return null;

  const daysLeft = differenceInDays(endDate, today);

  let status = {
    label: 'Active',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    icon: <ShieldCheck className="w-4 h-4" />,
  };

  if (daysLeft <= 0) {
    status = {
      label: 'Expired',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      icon: <XCircle className="w-4 h-4" />,
    };
  } else if (daysLeft <= 30) {
    status = {
      label: 'Expiring Soon',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      icon: <AlertTriangle className="w-4 h-4" />,
    };
  }

  const purchaseDate = doc?.date ? parseISO(doc.date) : null;
  const hasValidPurchaseDate = purchaseDate && isValid(purchaseDate);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="apple-blur rounded-2xl p-6 apple-shadow hover:apple-shadow-lg transition-shadow duration-300"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-semibold text-lg text-black">{doc.title}</h3>
          <p className="text-sm text-gray-500">{doc.vendor || 'No vendor'}</p>
        </div>
        <div className={`flex items-center gap-2 text-xs font-medium px-2 py-1 rounded-full ${status.bgColor} ${status.color}`}>
          {status.icon}
          <span>{status.label}</span>
        </div>
      </div>

      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">Project:</span>
          <span className="font-medium text-black">{projectName || 'N/A'}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-500">Purchase Date:</span>
          <span className="font-medium text-black">
            {hasValidPurchaseDate ? format(purchaseDate, 'PP') : 'N/A'}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-500">Warranty Ends:</span>
          <span className={`font-medium ${status.color}`}>{format(endDate, 'PP')}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-500">Time Left:</span>
          <span className={`font-medium ${status.color}`}>
            {daysLeft > 0 ? `${daysLeft} days` : 'Expired'}
          </span>
        </div>
      </div>

      {doc.file_url ? (
        <a
          href={doc.file_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:text-blue-600 text-xs font-medium mt-4 inline-flex items-center gap-1"
        >
          View Document <FileText className="w-3 h-3" />
        </a>
      ) : null}
    </motion.div>
  );
};

export default function WarrantiesPage() {
  const [warranties, setWarranties] = useState([]);
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState('asc');

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Dokumenty: jeśli jest filter -> używamy, jeśli nie -> list
        const docsPromise =
          typeof Document.filter === "function"
            ? Document.filter({ warranty_end_date: { $ne: null } })
            : Document.list();

        const [docsRaw, projectsRaw] = await Promise.all([
          docsPromise,
          Project.list(),
        ]);

        const docs = Array.isArray(docsRaw) ? docsRaw : [];
        const projs = Array.isArray(projectsRaw) ? projectsRaw : [];

        // Na wszelki wypadek zostawiamy tylko te z datą gwarancji
        setWarranties(docs.filter(d => d && d.warranty_end_date));
        setProjects(projs);
      } catch (error) {
        console.error("Error loading warranties:", error);
        setWarranties([]);
        setProjects([]);
      }
      setIsLoading(false);
    };

    loadData();
  }, []);

  const getProjectName = (projectId) => {
    if (!projectId) return undefined;
    return projects.find(p => p.id === projectId)?.name;
  };

  const sortedWarranties = [...warranties].sort((a, b) => {
    const dateA = new Date(a.warranty_end_date);
    const dateB = new Date(b.warranty_end_date);
    return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
          <div>
            <h1 className="text-4xl font-semibold text-black tracking-tight">
              Warranty Manager
            </h1>
            <p className="text-lg text-gray-500 font-normal mt-2">
              Track all your product warranties in one place.
            </p>
          </div>

          <div>
            <Select value={sortOrder} onValueChange={setSortOrder}>
              <SelectTrigger className="w-[180px] apple-blur">
                <SelectValue placeholder="Sort by..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">Expires Soonest</SelectItem>
                <SelectItem value="desc">Expires Latest</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-48 rounded-2xl" />)}
          </div>
        ) : sortedWarranties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence>
              {sortedWarranties.map(doc => (
                <WarrantyCard key={doc.id} doc={doc} projectName={getProjectName(doc.project_id)} />
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="text-center py-24 apple-blur rounded-2xl">
            <div className="w-16 h-16 mx-auto mb-6 bg-gray-100 rounded-2xl flex items-center justify-center">
              <ShieldCheck className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-medium text-black mb-2">
              No warranties found
            </h3>
            <p className="text-gray-500">
              When you upload a document, add a warranty end date to track it here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
