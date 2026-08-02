import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
    Camera,
    Search,
    Zap,
    MessageSquare,
    Plus
} from "lucide-react";

export default function QuickActions() {
  const { t } = useTranslation();

  const actions = [
    { title: t("dashboard.quickActions.scanDocument"), description: t("dashboard.quickActionsCard.scanDesc"), icon: Camera,       url: "Upload"     },
    { title: t("nav.search"),                          description: t("dashboard.quickActionsCard.searchDesc"), icon: Search,       url: "Search"     },
    { title: t("dashboard.quickActionsCard.askAssistant"), description: t("dashboard.quickActionsCard.askAssistantDesc"), icon: MessageSquare,url: "Assistant"  },
    { title: t("dashboard.quickActions.newProject"),   description: t("dashboard.quickActionsCard.newProjectDesc"), icon: Plus,         url: "Projects"   },
  ];

  return (
    <Card className="shadow-none border-0" style={{ backgroundColor: "var(--k-bg-surface)", border: "1px solid var(--k-border)" }}>
      <CardHeader className="border-b p-4" style={{ borderColor: "var(--k-border)" }}>
        <CardTitle className="text-base font-semibold flex items-center gap-2" style={{ color: "var(--k-text)" }}>
          <Zap className="w-4 h-4" style={{ color: "var(--k-accent)" }} />
          {t("dashboard.quickActionsCard.title")}
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
                  className="w-full h-auto p-4 flex flex-col items-center text-center gap-2 transition-all duration-200"
                  style={{ backgroundColor: "var(--k-bg)", borderColor: "var(--k-border)", color: "var(--k-text-muted)" }}
                >
                  <div className="icon-box w-8 h-8 rounded-lg flex items-center justify-center">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-xs" style={{ color: "var(--k-text)" }}>
                      {action.title}
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: "var(--k-text-subtle)" }}>
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
