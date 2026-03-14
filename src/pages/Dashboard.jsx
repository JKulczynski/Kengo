import React, { useState, useEffect, useRef } from "react";
import { Project } from "@/api/entities";
import { Document } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
    Plus,
    Camera,
    AlertTriangle,
    Clock,
    TrendingUp,
    Folder,
    FileText,
    Shield,
    Sparkles,
    ChevronRight
} from "lucide-react";
import { differenceInDays, parseISO, isValid } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

import ActiveProjects from "../components/dashboard/ActiveProjects";
import RecentDocuments from "../components/dashboard/RecentDocuments";

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [projectsData, documentsData] = await Promise.all([
        Project.list('-updated_date'),
        Document.list('-created_date', 50)
      ]);
      setProjects(projectsData);
      setDocuments(documentsData);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      setError("Nie udało się załadować danych.");
    }
    setIsLoading(false);
  };

  const totalSpent = documents.reduce((sum, doc) => sum + (doc.amount || 0), 0);
  const activeProjects = projects.filter(p => p.status === 'in_progress').length;
  const isEmpty = !isLoading && projects.length === 0 && documents.length === 0;

  // Compute reminders
  const today = new Date();
  const reminders = [];

  // Warranties expiring in 30 days
  const expiringWarranties = documents.filter(doc => {
    if (!doc.warranty_end_date) return false;
    const endDate = parseISO(doc.warranty_end_date);
    if (!isValid(endDate)) return false;
    const days = differenceInDays(endDate, today);
    return days >= 0 && days <= 30;
  });
  if (expiringWarranties.length > 0) {
    reminders.push({
      type: 'warning',
      icon: Shield,
      title: `${expiringWarranties.length === 1 ? 'Gwarancja wygasa' : `${expiringWarranties.length} gwarancje wygasają`} wkrótce`,
      desc: expiringWarranties.length === 1
        ? `"${expiringWarranties[0].title}" — sprawdź datę`
        : `W ciągu 30 dni. Sprawdź menedżer gwarancji.`,
      link: createPageUrl('Warranties'),
      color: 'bg-orange-50 border-orange-100',
      iconColor: 'text-orange-500',
      btnColor: 'text-orange-600 hover:text-orange-700'
    });
  }

  // Projects over budget
  const overBudgetProjects = projects.filter(p => {
    if (!p.budget || p.budget <= 0) return false;
    const spent = documents
      .filter(d => d.project_id === p.id)
      .reduce((sum, d) => sum + (d.amount || 0), 0);
    return spent > p.budget;
  });
  if (overBudgetProjects.length > 0) {
    reminders.push({
      type: 'error',
      icon: TrendingUp,
      title: `${overBudgetProjects.length === 1 ? 'Projekt' : `${overBudgetProjects.length} projekty`} przekroczyły budżet`,
      desc: overBudgetProjects.length === 1
        ? `"${overBudgetProjects[0].name}" — sprawdź wydatki`
        : `Sprawdź wydatki w szczegółach projektów.`,
      link: createPageUrl('Projects'),
      color: 'bg-red-50 border-red-100',
      iconColor: 'text-red-500',
      btnColor: 'text-red-600 hover:text-red-700'
    });
  }

  // Approaching deadlines (within 14 days)
  const approachingDeadlines = projects.filter(p => {
    if (!p.target_completion || p.status === 'completed') return false;
    const deadline = parseISO(p.target_completion);
    if (!isValid(deadline)) return false;
    const days = differenceInDays(deadline, today);
    return days >= 0 && days <= 14;
  });
  if (approachingDeadlines.length > 0) {
    reminders.push({
      type: 'info',
      icon: Clock,
      title: `Zbliżający się termin`,
      desc: approachingDeadlines.length === 1
        ? `"${approachingDeadlines[0].name}" — zostało ${differenceInDays(parseISO(approachingDeadlines[0].target_completion), today)} dni`
        : `${approachingDeadlines.length} projektów ma termin w ciągu 14 dni.`,
      link: createPageUrl('Projects'),
      color: 'bg-blue-50 border-blue-100',
      iconColor: 'text-blue-500',
      btnColor: 'text-blue-600 hover:text-blue-700'
    });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12">

        {error && (
          <div className="mb-8 p-4 bg-red-50 rounded-xl border border-red-100 flex items-center justify-between">
            <p className="text-red-600 text-sm">{error}</p>
            <Button size="sm" variant="outline" onClick={loadData} className="ml-4 text-sm">
              Spróbuj ponownie
            </Button>
          </div>
        )}

        {/* === ONBOARDING — widoczne tylko przy pustej apce === */}
        {isEmpty && (
          <div className="mb-12">
            <div className="apple-blur rounded-3xl p-8 md:p-12 apple-shadow text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl md:text-4xl font-semibold text-black tracking-tight mb-3">
                Witaj w Kengo!
              </h1>
              <p className="text-lg text-gray-500 max-w-lg mx-auto mb-8">
                Twój osobisty asystent remontowy. Zacznij od stworzenia pierwszego projektu — a resztą zajmiemy się razem.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to={createPageUrl("Projects")}>
                  <Button className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-6 py-3 text-sm font-medium">
                    <Plus className="w-4 h-4 mr-2" />
                    Stwórz pierwszy projekt
                  </Button>
                </Link>
                <Link to={createPageUrl("Upload")}>
                  <Button variant="outline" className="rounded-lg px-6 py-3 text-sm font-medium text-black border-gray-200">
                    <Camera className="w-4 h-4 mr-2" />
                    Dodaj dokument
                  </Button>
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  icon: Folder,
                  color: 'bg-blue-50',
                  iconColor: 'text-blue-500',
                  title: 'Projekty',
                  desc: 'Śledź postęp, budżet i termin każdego remontu w jednym miejscu.'
                },
                {
                  icon: FileText,
                  color: 'bg-green-50',
                  iconColor: 'text-green-500',
                  title: 'Dokumenty',
                  desc: 'Faktury, paragony, umowy — AI automatycznie rozpoznaje i kategoryzuje.'
                },
                {
                  icon: Shield,
                  color: 'bg-purple-50',
                  iconColor: 'text-purple-500',
                  title: 'Gwarancje',
                  desc: 'Nie zapomnij o gwarancji. Dostajesz przypomnienie zanim wygaśnie.'
                }
              ].map(({ icon: Icon, color, iconColor, title, desc }) => (
                <div key={title} className="apple-blur rounded-2xl p-6 apple-shadow">
                  <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center mb-4`}>
                    <Icon className={`w-5 h-5 ${iconColor}`} />
                  </div>
                  <h3 className="font-semibold text-black mb-2">{title}</h3>
                  <p className="text-sm text-gray-500">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* === NORMALNY DASHBOARD === */}
        {!isEmpty && (
          <>
            {/* Header */}
            <div className="mb-8 md:mb-10">
              <h1 className="text-3xl md:text-4xl font-semibold text-black mb-3 tracking-tight">
                Dzień dobry
              </h1>
              <p className="text-base md:text-lg text-gray-500 font-normal">
                Oto co dzieje się z Twoimi projektami
              </p>
            </div>

            {/* Reminders */}
            {reminders.length > 0 && (
              <div className="space-y-3 mb-8">
                {reminders.map((r, i) => {
                  const Icon = r.icon;
                  return (
                    <div key={i} className={`flex items-center gap-4 p-4 rounded-xl border ${r.color}`}>
                      <div className={`flex-shrink-0 ${r.iconColor}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-black text-sm">{r.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{r.desc}</p>
                      </div>
                      <Link to={r.link}>
                        <Button variant="ghost" size="sm" className={`${r.btnColor} text-xs font-medium flex-shrink-0`}>
                          Sprawdź <ChevronRight className="w-3 h-3 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Quick Actions */}
            <div className="flex flex-col sm:flex-row gap-3 mb-8 md:mb-12">
              <Link to={createPageUrl("Upload")} className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-6 py-3 text-sm font-medium transition-colors duration-200">
                  <Camera className="w-4 h-4 mr-2" />
                  Skanuj dokument
                </Button>
              </Link>
              <Link to={createPageUrl("Projects")} className="w-full sm:w-auto">
                <Button variant="outline" className="w-full sm:w-auto border-gray-200 hover:bg-gray-50 rounded-lg px-6 py-3 text-sm font-medium text-black">
                  <Plus className="w-4 h-4 mr-2" />
                  Nowy projekt
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
                  Aktywne projekty
                </div>
              </div>

              <div className="apple-blur rounded-2xl p-6 apple-shadow">
                <div className="text-2xl md:text-3xl font-semibold text-black mb-1">
                  {totalSpent.toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' })}
                </div>
                <div className="text-sm text-gray-500 font-normal">
                  Łączne wydatki
                </div>
              </div>

              <div className="apple-blur rounded-2xl p-6 apple-shadow">
                <div className="text-2xl md:text-3xl font-semibold text-black mb-1">
                  {documents.length}
                </div>
                <div className="text-sm text-gray-500 font-normal">
                  Dokumenty
                </div>
              </div>
            </div>

            {/* Wykres budżetu projektów */}
            {projects.length > 0 && (() => {
              const chartData = projects
                .filter(p => p.budget > 0)
                .slice(0, 6)
                .map(p => {
                  const spent = documents
                    .filter(d => d.project_id === p.id)
                    .reduce((s, d) => s + (d.amount || 0), 0);
                  return {
                    name: p.name.length > 14 ? p.name.slice(0, 14) + '…' : p.name,
                    Budżet: p.budget,
                    Wydano: spent,
                    overBudget: spent > p.budget,
                  };
                });

              if (chartData.length === 0) return null;

              return (
                <div className="apple-blur rounded-2xl apple-shadow p-6 mb-8">
                  <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--k-text)", letterSpacing: "-0.01em" }}>
                    Budżet projektów
                  </h3>
                  <ResponsiveContainer width="100%" height={160}>
                    <BarChart data={chartData} barGap={4} barCategoryGap="30%">
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 11, fill: "var(--k-text-muted)", fontFamily: "inherit" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis hide />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "var(--k-bg-surface)",
                          border: "1px solid var(--k-border-md)",
                          borderRadius: "0.75rem",
                          fontSize: 12,
                          fontFamily: "inherit",
                          color: "var(--k-text)",
                        }}
                        formatter={(val) => `${val.toLocaleString('pl-PL')} zł`}
                        cursor={{ fill: "var(--k-bg-hover)" }}
                      />
                      <Bar dataKey="Budżet" radius={[4, 4, 0, 0]} fill="var(--k-border-strong)" />
                      <Bar dataKey="Wydano" radius={[4, 4, 0, 0]}>
                        {chartData.map((entry, i) => (
                          <Cell
                            key={i}
                            fill={entry.overBudget ? "#d97706" : "var(--k-accent)"}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ backgroundColor: "var(--k-border-strong)" }} />
                      <span className="text-xs" style={{ color: "var(--k-text-muted)" }}>Budżet</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ backgroundColor: "var(--k-accent)" }} />
                      <span className="text-xs" style={{ color: "var(--k-text-muted)" }}>Wydano</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-sm inline-block bg-amber-500" />
                      <span className="text-xs" style={{ color: "var(--k-text-muted)" }}>Przekroczono</span>
                    </div>
                  </div>
                </div>
              );
            })()}

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
          </>
        )}
      </div>
    </div>
  );
}
