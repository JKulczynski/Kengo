
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User } from "@/api/entities";
import {
    Home,
    Upload,
    FolderOpen,
    Search,
    Hammer,
    User as UserIcon,
    ShieldCheck,
    FileText,
    Users,
    StickyNote,
    MessageSquare,
    Palette
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";

const getInitials = (name) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length > 1 && names[names.length - 1]) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name[0].toUpperCase();
};

const navigationItems = [
  { title: "Pulpit",          url: createPageUrl("Dashboard"),  icon: Home },
  { title: "Projekty",        url: createPageUrl("Projects"),   icon: FolderOpen },
  { title: "Dokumenty",       url: createPageUrl("Documents"),  icon: FileText },
  { title: "Gwarancje",       url: createPageUrl("Warranties"), icon: ShieldCheck },
  { title: "Dodaj dokument",  url: createPageUrl("Upload"),     icon: Upload },
  { title: "Szukaj",          url: createPageUrl("Search"),     icon: Search },
  { title: "Notatki",         url: "/notes",                    icon: StickyNote },
  { title: "Asystent",        url: createPageUrl("Assistant"),  icon: MessageSquare },
  { title: "Zespół",          url: createPageUrl("Team"),       icon: Users },
  { title: "Profil",          url: createPageUrl("Profile"),    icon: UserIcon },
];

// 3 warianty kolorystyczne do testów
const THEMES = [
  { id: "",             label: "Karesansui", dot: "#889078", title: "Ogród kamienny" },
  { id: "theme-aizome", label: "Aizome",     dot: "#1B5FA8", title: "Japoński indygo" },
  { id: "theme-moegi",  label: "Moegi",      dot: "#2A6B3E", title: "Świeży bambus" },
];

export default function Layout({ children }) {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [activeTheme, setActiveTheme] = useState("");
  const [showThemePicker, setShowThemePicker] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await User.me();
        setUser(currentUser);
      } catch (error) {
        console.error("Not logged in", error);
      } finally {
        setIsLoadingUser(false);
      }
    };
    fetchUser();
  }, []);

  // Przełączanie motywu — zapisuje w localStorage
  useEffect(() => {
    const saved = localStorage.getItem("kengo-theme") || "";
    setActiveTheme(saved);
    applyTheme(saved);
  }, []);

  const applyTheme = (themeId) => {
    const html = document.documentElement;
    html.classList.remove("theme-aizome", "theme-moegi");
    if (themeId) html.classList.add(themeId);
  };

  const switchTheme = (themeId) => {
    setActiveTheme(themeId);
    applyTheme(themeId);
    localStorage.setItem("kengo-theme", themeId);
    setShowThemePicker(false);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full" style={{ backgroundColor: "var(--k-bg)" }}>

        <Sidebar
          className="border-r"
          style={{ borderColor: "var(--k-border-md)", backgroundColor: "var(--k-bg-sidebar)" }}
        >
          {/* Logo */}
          <SidebarHeader
            className="border-b p-6"
            style={{ borderColor: "var(--k-border)" }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "linear-gradient(135deg, var(--k-accent-dark) 0%, var(--k-accent) 100%)" }}
              >
                <Hammer className="w-4 h-4" style={{ color: "var(--k-accent-text)", strokeWidth: 2 }} />
              </div>
              <div>
                <h2 className="font-semibold text-base" style={{ color: "var(--k-text)", letterSpacing: "-0.02em" }}>
                  Kengo
                </h2>
                <p className="text-xs font-normal" style={{ color: "var(--k-text-subtle)" }}>
                  Asystent remontu
                </p>
              </div>
            </div>
          </SidebarHeader>

          {/* Nawigacja */}
          <SidebarContent className="p-2">
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigationItems.map((item) => {
                    const isActive = location.pathname === item.url;
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          className="mx-1 rounded-lg font-normal"
                          style={
                            isActive
                              ? { backgroundColor: "var(--k-bg-active)", color: "var(--k-accent-dark)" }
                              : { color: "var(--k-text-muted)" }
                          }
                        >
                          <Link to={item.url} className="flex items-center gap-3 px-3 py-2">
                            <item.icon
                              className="w-4 h-4 flex-shrink-0"
                              style={isActive ? { color: "var(--k-accent)", strokeWidth: 2 } : {}}
                            />
                            <span className="text-sm">{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {/* Beta banner */}
            <SidebarGroup className="mt-auto p-4">
              <div
                className="p-4 rounded-xl text-center"
                style={{ backgroundColor: "var(--k-accent-light)", border: "1px solid var(--k-border-md)" }}
              >
                <h4 className="font-semibold text-sm" style={{ color: "var(--k-accent-dark)" }}>
                  Wersja Beta
                </h4>
                <p className="text-xs mt-1 mb-3" style={{ color: "var(--k-accent-dark)", opacity: 0.75 }}>
                  Twoja opinia kształtuje Kengo.
                </p>
                <button
                  className="text-xs font-semibold rounded-full px-4 py-1.5"
                  style={{
                    background: "linear-gradient(135deg, var(--k-accent), var(--k-accent-dark))",
                    color: "var(--k-accent-text)"
                  }}
                >
                  Wyślij opinię
                </button>
              </div>
            </SidebarGroup>
          </SidebarContent>

          {/* Stopka — użytkownik + przełącznik motywu */}
          <SidebarFooter
            className="border-t p-4 space-y-3"
            style={{ borderColor: "var(--k-border)" }}
          >
            {/* Theme picker */}
            <div className="relative">
              <button
                onClick={() => setShowThemePicker(p => !p)}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs"
                style={{ color: "var(--k-text-subtle)" }}
              >
                <Palette className="w-3.5 h-3.5" />
                <span>Motyw:</span>
                <span style={{ color: "var(--k-accent)", fontWeight: 600 }}>
                  {THEMES.find(t => t.id === activeTheme)?.label ?? "Washi"}
                </span>
              </button>

              {showThemePicker && (
                <div
                  className="absolute bottom-full left-0 mb-2 w-48 rounded-xl p-2 z-50 apple-shadow"
                  style={{ backgroundColor: "var(--k-bg-surface)", border: "1px solid var(--k-border-md)" }}
                >
                  {THEMES.map(t => (
                    <button
                      key={t.id}
                      onClick={() => switchTheme(t.id)}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-sm"
                      style={
                        activeTheme === t.id
                          ? { backgroundColor: "var(--k-bg-active)", color: "var(--k-accent-dark)" }
                          : { color: "var(--k-text-muted)" }
                      }
                    >
                      <span
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: t.dot }}
                      />
                      <div>
                        <div className="font-medium text-xs">{t.label}</div>
                        <div className="text-xs opacity-60">{t.title}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Profil */}
            <Link
              to={createPageUrl("Profile")}
              className="flex items-center gap-3 p-2 -mx-2 rounded-lg"
            >
              {isLoadingUser ? (
                <>
                  <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <Skeleton className="h-4 w-20 mb-1" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </>
              ) : user ? (
                <>
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: "var(--k-accent-light)" }}
                  >
                    <span className="font-semibold text-sm" style={{ color: "var(--k-accent-dark)" }}>
                      {getInitials(user.full_name)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate" style={{ color: "var(--k-text)" }}>
                      {user.full_name || "Użytkownik"}
                    </p>
                    <p className="text-xs truncate" style={{ color: "var(--k-text-subtle)" }}>
                      {user.email}
                    </p>
                  </div>
                </>
              ) : (
                <p className="text-sm" style={{ color: "var(--k-text-subtle)" }}>Nie zalogowano</p>
              )}
            </Link>
          </SidebarFooter>
        </Sidebar>

        {/* Główna treść */}
        <main className="flex-1 flex flex-col" style={{ backgroundColor: "var(--k-bg)" }}>
          <header
            className="apple-blur border-b px-4 py-3 md:hidden"
            style={{ borderColor: "var(--k-border)" }}
          >
            <div className="flex items-center gap-4">
              <SidebarTrigger
                className="p-2 rounded-lg"
                style={{ color: "var(--k-text)" }}
              />
              <h1 className="text-lg font-medium" style={{ color: "var(--k-text)", letterSpacing: "-0.02em" }}>
                Kengo
              </h1>
            </div>
          </header>

          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
