import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Document } from '@/api/entities';
import { Project } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { format, differenceInDays, parseISO, isValid } from 'date-fns';
import { ShieldCheck, AlertTriangle, XCircle, FileText } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from 'framer-motion';

const WarrantyCard = ({ doc, projectName, t }) => {
  const today = new Date();

  // Bezpieczne parsowanie daty
  const endDate = doc?.warranty_end_date ? parseISO(doc.warranty_end_date) : null;
  const hasValidEndDate = endDate && isValid(endDate);

  if (!hasValidEndDate) return null;

  const daysLeft = differenceInDays(endDate, today);

  let status = {
    label: t("warranties.status.active"),
    style: { backgroundColor: 'var(--k-ok-bg)', color: 'var(--k-ok-color)' },
    icon: <ShieldCheck className="w-4 h-4" />,
  };

  if (daysLeft <= 0) {
    status = {
      label: t("warranties.status.expired"),
      style: { backgroundColor: 'var(--k-err-bg)', color: 'var(--k-err-color)' },
      icon: <XCircle className="w-4 h-4" />,
    };
  } else if (daysLeft <= 30) {
    status = {
      label: t("warranties.status.expiringSoon"),
      style: { backgroundColor: 'var(--k-warn-bg)', color: 'var(--k-warn-color)' },
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
          <h3 className="font-semibold text-lg" style={{ color: "var(--k-text)" }}>{doc.title}</h3>
          <p className="text-sm" style={{ color: "var(--k-text-subtle)" }}>{doc.vendor || t("warranties.noVendor")}</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium px-2 py-1 rounded-full" style={status.style}>
          {status.icon}
          <span>{status.label}</span>
        </div>
      </div>

      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span style={{ color: "var(--k-text-subtle)" }}>{t("warranties.fields.project")}</span>
          <span className="font-medium" style={{ color: "var(--k-text)" }}>{projectName || t("common.none")}</span>
        </div>

        <div className="flex justify-between">
          <span style={{ color: "var(--k-text-subtle)" }}>{t("warranties.fields.purchaseDate")}</span>
          <span className="font-medium" style={{ color: "var(--k-text)" }}>
            {hasValidPurchaseDate ? format(purchaseDate, 'dd.MM.yyyy') : t("common.none")}
          </span>
        </div>

        <div className="flex justify-between">
          <span style={{ color: "var(--k-text-subtle)" }}>{t("warranties.fields.warrantyUntil")}</span>
          <span className="font-medium" style={{ color: status.style.color }}>{format(endDate, 'dd.MM.yyyy')}</span>
        </div>

        <div className="flex justify-between">
          <span style={{ color: "var(--k-text-subtle)" }}>{t("warranties.fields.remaining")}</span>
          <span className="font-medium" style={{ color: status.style.color }}>
            {daysLeft > 0 ? t("warranties.daysLeft", { days: daysLeft }) : t("warranties.status.expired")}
          </span>
        </div>
      </div>

      {doc.file_url ? (
        <a
          href={doc.file_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-medium mt-4 inline-flex items-center gap-1"
          style={{ color: "var(--k-accent)" }}
        >
          {t("warranties.viewDocument")} <FileText className="w-3 h-3" />
        </a>
      ) : null}
    </motion.div>
  );
};

export default function WarrantiesPage() {
  const { t } = useTranslation();
  const [warranties, setWarranties] = useState([]);
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState('asc');
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
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
        setError(t("warranties.errorLoad"));
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
    <div className="min-h-full" style={{ backgroundColor: "var(--k-bg)" }}>
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight" style={{ color: "var(--k-text)" }}>
              {t("warranties.header.title")}
            </h1>
            <p className="text-lg font-normal mt-2" style={{ color: "var(--k-text-subtle)" }}>
              {t("warranties.header.subtitle")}
            </p>
          </div>

          <div>
            <Select value={sortOrder} onValueChange={setSortOrder}>
              <SelectTrigger className="w-[180px] apple-blur">
                <SelectValue placeholder={t("warranties.sort.placeholder")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">{t("warranties.sort.asc")}</SelectItem>
                <SelectItem value="desc">{t("warranties.sort.desc")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {error && (
          <div className="mb-8 p-4 rounded-xl flex items-center justify-between" style={{ backgroundColor: "var(--k-err-bg)", border: "1px solid var(--k-border-md)" }}>
            <p className="text-sm" style={{ color: "var(--k-err-color)" }}>{error}</p>
            <Button variant="outline" size="sm" onClick={() => window.location.reload()} className="ml-4 text-sm">
              {t("common.tryAgain")}
            </Button>
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-48 rounded-2xl" />)}
          </div>
        ) : sortedWarranties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence>
              {sortedWarranties.map(doc => (
                <WarrantyCard key={doc.id} doc={doc} projectName={getProjectName(doc.project_id)} t={t} />
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="text-center py-24 apple-blur rounded-2xl">
            <div className="icon-box w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-medium mb-2" style={{ color: "var(--k-text)" }}>
              {t("warranties.empty.title")}
            </h3>
            <p style={{ color: "var(--k-text-subtle)" }}>
              {t("warranties.empty.desc")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
