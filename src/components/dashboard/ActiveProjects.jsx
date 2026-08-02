
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
    Plus,
    ArrowUpRight
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function ActiveProjects({ projects, documents, isLoading, onProjectUpdate }) {
  const { t } = useTranslation();

  const TYPE_LABELS = {
    kitchen: t("common.projectTypes.kitchen"), bathroom: t("common.projectTypes.bathroom"), living_room: t("common.projectTypes.living_room"),
    bedroom: t("common.projectTypes.bedroom"), outdoor: t("common.projectTypes.outdoor"), whole_house: t("common.projectTypes.whole_house"),
    basement: t("common.projectTypes.basement"), attic: t("common.projectTypes.attic"), other: t("common.projectTypes.other")
  };

  const statusConfig = {
    planning:    { label: t("common.projectStatus.planning"),    style: { backgroundColor: "var(--k-icon-bg)",  color: "var(--k-icon-color)" } },
    in_progress: { label: t("common.projectStatus.in_progress"), style: { backgroundColor: "var(--k-warn-bg)",  color: "var(--k-warn-color)" } },
    on_hold:     { label: t("common.projectStatus.on_hold"),     style: { backgroundColor: "var(--k-err-bg)",   color: "var(--k-err-color)" } },
    completed:   { label: t("common.projectStatus.completed"),   style: { backgroundColor: "var(--k-ok-bg)",    color: "var(--k-ok-color)" } },
  };

  if (isLoading) {
    return (
      <div className="apple-blur rounded-2xl p-8 apple-shadow">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-semibold" style={{ color: "var(--k-text)" }}>{t("nav.projects")}</h2>
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
        <h2 className="text-xl font-semibold tracking-tight" style={{ color: "var(--k-text)" }}>{t("nav.projects")}</h2>
        <Link to={createPageUrl("Projects")}>
          <Button variant="ghost" size="sm" style={{ color: "var(--k-text-muted)" }}>
            <ArrowUpRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-12 md:py-16">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: "var(--k-accent-light)" }}>
            <Plus className="w-6 h-6" style={{ color: "var(--k-accent)" }} />
          </div>
          <h3 className="font-medium mb-2" style={{ color: "var(--k-text)" }}>{t("dashboard.empty.noActiveProjects")}</h3>
          <p className="text-sm mb-6" style={{ color: "var(--k-text-muted)" }}>
            {t("dashboard.empty.noActiveProjectsDesc")}
          </p>
          <Link to={createPageUrl("Projects")}>
            <Button className="btn-primary">{t("common.createProject")}</Button>
          </Link>
        </div>
      ) : (
        <>
          {/* Mobile carousel (md:hidden) */}
          <div className="md:hidden -mx-2 relative">
            {projects.length > 1 && (
              <div
                className="absolute right-0 top-0 bottom-3 w-10 pointer-events-none z-10"
                style={{ background: "linear-gradient(to right, transparent, var(--k-bg-card) 85%)" }}
              />
            )}
            <div className="flex gap-3 overflow-x-auto px-2 pb-3 snap-x snap-mandatory scrollbar-hide">
              {projects.map((project) => {
                const projectDocs = documents ? documents.filter(d => d.project_id === project.id) : [];
                const actualCost = projectDocs.reduce((sum, doc) => sum + (doc.amount || 0), 0);
                const budgetUsage = project.budget > 0 ? (actualCost / project.budget) * 100 : 0;
                return (
                  <Link
                    key={project.id}
                    to={`/project/${project.id}`}
                    className="flex-shrink-0 w-64 snap-start apple-blur rounded-2xl p-4 apple-shadow block"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-sm leading-tight pr-2" style={{ color: "var(--k-text)" }}>{project.name}</h3>
                      <Badge style={statusConfig[project.status]?.style} className="border-0 text-xs flex-shrink-0">{statusConfig[project.status]?.label}</Badge>
                    </div>
                    {project.budget > 0 && (
                      <>
                        <div className="flex justify-between text-xs mb-1" style={{ color: "var(--k-text-muted)" }}>
                          <span>{actualCost.toLocaleString('pl-PL')} zł</span>
                          <span>{project.budget.toLocaleString('pl-PL')} zł</span>
                        </div>
                        <div className="w-full rounded-full h-1.5" style={{ backgroundColor: "var(--k-border)" }}>
                          <div
                            className="rounded-full h-1.5 transition-all"
                            style={{
                              width: `${Math.min(budgetUsage, 100)}%`,
                              backgroundColor: budgetUsage > 100 ? "var(--k-err-color)" : budgetUsage > 75 ? "#f59e0b" : "var(--k-accent)"
                            }}
                          />
                        </div>
                      </>
                    )}
                    <div className="mt-3">
                      <div className="w-full rounded-full h-1" style={{ backgroundColor: "var(--k-border)" }}>
                        <div
                          className="rounded-full h-1"
                          style={{ width: `${project.progress_percentage || 0}%`, backgroundColor: "var(--k-accent)" }}
                        />
                      </div>
                      <p className="text-xs mt-1" style={{ color: "var(--k-text-subtle)" }}>{t("projects.card.percentComplete", { pct: project.progress_percentage || 0 })}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Desktop lista (hidden md:block) */}
          <div className="hidden md:block">
            <div className="space-y-6 md:space-y-8">
              {projects.map((project) => {
                const projectDocs = documents ? documents.filter(d => d.project_id === project.id) : [];
                const actualCost = projectDocs.reduce((sum, doc) => sum + (doc.amount || 0), 0);
                const budgetUsage = project.budget > 0 ? (actualCost / project.budget) * 100 : 0;

                let budgetBarColor = "var(--k-accent)";
                if (budgetUsage > 75) budgetBarColor = "#f59e0b";
                if (budgetUsage > 100) budgetBarColor = "var(--k-err-color)";

                return (
                  <Link
                    key={project.id}
                    to={`/project/${project.id}`}
                    className="block group rounded-lg p-4 -m-4 transition-colors cursor-pointer"
                    style={{ }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = "var(--k-bg-hover)"}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = ""}
                  >
                    <div>
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-medium text-base md:text-lg mb-1" style={{ color: "var(--k-text)" }}>
                            {project.name}
                          </h3>
                          <p className="text-sm" style={{ color: "var(--k-text-muted)" }}>
                            {TYPE_LABELS[project.type] || project.type.replace(/_/g, ' ')}
                          </p>
                        </div>
                        <Badge style={statusConfig[project.status]?.style} className="border-0 text-xs font-medium">
                          {statusConfig[project.status]?.label}
                        </Badge>
                      </div>

                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs" style={{ color: "var(--k-text-muted)" }}>
                            {project.current_phase?.replace(/_/g, ' ') || t("common.projectStatus.planning")}
                          </span>
                          <span className="text-xs font-medium" style={{ color: "var(--k-text)" }}>
                            {project.progress_percentage || 0}%
                          </span>
                        </div>
                        <div className="w-full rounded-full h-1" style={{ backgroundColor: "var(--k-border)" }}>
                          <div
                            className="rounded-full h-1 transition-all duration-300"
                            style={{ width: `${project.progress_percentage || 0}%`, backgroundColor: "var(--k-accent)" }}
                          />
                        </div>
                      </div>

                      {project.budget > 0 && (
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs" style={{ color: "var(--k-text-muted)" }}>
                              {t("projects.card.budgetLine", { cost: actualCost.toLocaleString('pl-PL'), budget: project.budget.toLocaleString('pl-PL') })}
                            </span>
                            <span className="text-xs font-medium" style={{ color: budgetUsage > 100 ? "var(--k-err-color)" : "var(--k-text)" }}>
                              {budgetUsage.toFixed(0)}%
                            </span>
                          </div>
                          <div className="w-full rounded-full h-1" style={{ backgroundColor: "var(--k-border)" }}>
                            <div
                              className="rounded-full h-1 transition-all duration-300"
                              style={{ width: `${Math.min(budgetUsage, 100)}%`, backgroundColor: budgetBarColor }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
