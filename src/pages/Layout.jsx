
import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User } from "@/api/entities";
import { Project } from "@/api/entities";
import {
    Home,
    Upload,
    FolderOpen,
    Search,
    Hammer,
    Camera,
    User as UserIcon,
    ShieldCheck,
    FileText,
    Users,
    StickyNote,
    MessageSquare,
    Palette,
    Menu,
    X,
    ChevronRight,
    Plus,
    MoreHorizontal
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
  { title: "Pulpit",    url: createPageUrl("Dashboard"),  icon: Home },
  { title: "Projekty",  url: createPageUrl("Projects"),   icon: FolderOpen },
  { title: "Dokumenty", url: createPageUrl("Documents"),  icon: FileText },
  { title: "Gwarancje", url: createPageUrl("Warranties"), icon: ShieldCheck },
  { title: "Szukaj",    url: createPageUrl("Search"),     icon: Search },
  { title: "Notatki",   url: "/notes",                    icon: StickyNote },
  { title: "Asystent",  url: createPageUrl("Assistant"),  icon: MessageSquare },
  { title: "Zespół",    url: createPageUrl("Team"),       icon: Users },
  { title: "Profil",    url: createPageUrl("Profile"),    icon: UserIcon },
];

// 3 warianty kolorystyczne do testów
const THEMES = [
  { id: "",             label: "Karesansui", dot: "#889078", title: "Ogród kamienny" },
  { id: "theme-ukiyo",  label: "Ukiyo",      dot: "#967249", title: "Unoszący się świat" },
  { id: "theme-aizome", label: "Aizome",     dot: "#4B5E70", title: "Tradycyjne indygo" },
  { id: "theme-moegi",  label: "Moegi",      dot: "#2A6B3E", title: "Świeży bambus" },
];

// Pozycje w hamburger menu (te których nie ma w bottom nav)
const drawerItems = [
  { title: "Dokumenty",      url: createPageUrl("Documents"),  icon: FileText },
  { title: "Gwarancje",      url: createPageUrl("Warranties"), icon: ShieldCheck },
  { title: "Szukaj",         url: createPageUrl("Search"),     icon: Search },
  { title: "Notatki",        url: "/notes",                    icon: StickyNote },
  { title: "Zespół",         url: createPageUrl("Team"),       icon: Users },
];

export default function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [activeTheme, setActiveTheme] = useState("");
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [globalPlusOpen, setGlobalPlusOpen] = useState(false);
  const [recentProjects, setRecentProjects] = useState([]);
  const [betaDismissed, setBetaDismissed] = useState(() => localStorage.getItem('kengo-beta-dismissed') === '1');
  const plusRef = useRef(null);

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

  useEffect(() => {
    const loadRecent = async () => {
      try {
        const data = await Project.list('-updated_date');
        setRecentProjects(data);
      } catch (e) {
        // silent — sidebar sub-items are non-critical
      }
    };
    loadRecent();
  }, []);

  useEffect(() => {
    if (!globalPlusOpen) return;
    const handleClickOutside = (e) => {
      if (plusRef.current && !plusRef.current.contains(e.target)) {
        setGlobalPlusOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [globalPlusOpen]);

  // Cmd+K / Ctrl+K — otwiera wyszukiwarkę
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        navigate(createPageUrl('Search'));
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  // Przełączanie motywu — zapisuje w localStorage
  useEffect(() => {
    const saved = localStorage.getItem("kengo-theme") || "";
    setActiveTheme(saved);
    applyTheme(saved);
  }, []);

  const applyTheme = (themeId) => {
    const html = document.documentElement;
    html.classList.remove("theme-ukiyo", "theme-aizome", "theme-moegi");
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
                <p className="font-semibold text-base" style={{ color: "var(--k-text)", letterSpacing: "-0.02em" }}>
                  Kengo
                </p>
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
                {/* Global Plus Button */}
                <div className="px-1 pb-2" ref={plusRef}>
                  <div className="relative">
                    <button
                      onClick={() => setGlobalPlusOpen(p => !p)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
                      style={{
                        background: "linear-gradient(135deg, var(--k-accent), var(--k-accent-dark))",
                        color: "var(--k-accent-text)"
                      }}
                    >
                      <Plus className="w-4 h-4" />
                      Nowy
                    </button>
                    {globalPlusOpen && (
                      <div
                        className="absolute top-full left-0 mt-2 w-48 rounded-xl p-1.5 z-50 apple-shadow"
                        style={{ backgroundColor: "var(--k-bg-surface)", border: "1px solid var(--k-border-md)" }}
                      >
                        <Link
                          to={`${createPageUrl("Projects")}?new=1`}
                          onClick={() => setGlobalPlusOpen(false)}
                          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm w-full"
                          style={{ color: "var(--k-text-muted)" }}
                        >
                          <FolderOpen className="w-4 h-4 flex-shrink-0" style={{ color: "var(--k-accent)" }} />
                          Nowy projekt
                        </Link>
                        <Link
                          to={createPageUrl("Upload")}
                          onClick={() => setGlobalPlusOpen(false)}
                          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm w-full"
                          style={{ color: "var(--k-text-muted)" }}
                        >
                          <Upload className="w-4 h-4 flex-shrink-0" style={{ color: "var(--k-accent)" }} />
                          Dodaj dokument
                        </Link>
                        <Link
                          to="/notes?new=1"
                          onClick={() => setGlobalPlusOpen(false)}
                          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm w-full"
                          style={{ color: "var(--k-text-muted)" }}
                        >
                          <StickyNote className="w-4 h-4 flex-shrink-0" style={{ color: "var(--k-accent)" }} />
                          Szybka notatka
                        </Link>
                      </div>
                    )}
                  </div>
                </div>

                <SidebarMenu>
                  {navigationItems.map((item) => {
                    const isActive = location.pathname === item.url;
                    return (
                      <React.Fragment key={item.title}>
                        <SidebarMenuItem>
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
                        {item.title === "Projekty" && recentProjects.length > 0 && recentProjects.map(proj => (
                          <SidebarMenuItem key={proj.id}>
                            <SidebarMenuButton asChild className="mx-1 rounded-lg font-normal">
                              <Link
                                to={`/project/${proj.id}`}
                                className="flex items-center gap-2 pl-8 py-1"
                                style={{ color: "var(--k-text-subtle)" }}
                              >
                                <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ backgroundColor: "var(--k-border-strong)" }} />
                                <span className="text-xs truncate">{proj.name}</span>
                              </Link>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        ))}
                      </React.Fragment>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {/* Beta banner */}
            {!betaDismissed && (
              <SidebarGroup className="mt-auto p-4">
                <div
                  className="relative p-4 rounded-xl text-center"
                  style={{ backgroundColor: "var(--k-accent-light)", border: "1px solid var(--k-border-md)" }}
                >
                  <button
                    onClick={() => { setBetaDismissed(true); localStorage.setItem('kengo-beta-dismissed', '1'); }}
                    className="absolute top-2 right-2 w-5 h-5 flex items-center justify-center rounded-full opacity-50 hover:opacity-100"
                    style={{ color: "var(--k-accent-dark)" }}
                  >
                    <X className="w-3 h-3" />
                  </button>
                  <p className="font-semibold text-sm" style={{ color: "var(--k-accent-dark)" }}>
                    Wersja Beta
                  </p>
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
            )}
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
                <span style={{ color: "var(--k-accent-dark)", fontWeight: 600 }}>
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
        <main className="flex-1 flex flex-col min-w-0" style={{ backgroundColor: "var(--k-bg)" }}>
          {/* Topbar mobilny — slim */}
          <header
            className="apple-blur border-b px-4 py-2.5 md:hidden flex-shrink-0"
            style={{ borderColor: "var(--k-border)" }}
          >
            <div className="flex items-center justify-between">
              {/* Logo — lewa strona */}
              <div className="flex items-center gap-2">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: "linear-gradient(135deg, var(--k-accent-dark), var(--k-accent))" }}
                >
                  <Hammer className="w-3.5 h-3.5" style={{ color: "var(--k-accent-text)", strokeWidth: 2.5 }} />
                </div>
                <p className="text-base font-semibold" style={{ color: "var(--k-text)", letterSpacing: "-0.02em" }}>
                  Kengo
                </p>
              </div>

              {/* Szukaj — prawa strona */}
              <Link
                to={createPageUrl("Search")}
                className="w-9 h-9 flex items-center justify-center rounded-xl"
                style={{ color: "var(--k-text-muted)" }}
                aria-label="Szukaj"
              >
                <Search className="w-5 h-5" />
              </Link>
            </div>
          </header>

          {/* ====== DRAWER MOBILNY ====== */}
          {drawerOpen && (
            <div className="md:hidden fixed inset-0 z-[60] flex">
              {/* Overlay */}
              <div
                className="absolute inset-0"
                style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
                onClick={() => setDrawerOpen(false)}
              />

              {/* Panel */}
              <div
                className="relative w-72 max-w-[85vw] h-full flex flex-col apple-shadow"
                style={{ backgroundColor: "var(--k-bg-sidebar)" }}
              >
                {/* Nagłówek drawera */}
                <div
                  className="flex items-center justify-between px-5 py-4 border-b"
                  style={{ borderColor: "var(--k-border)" }}
                >
                  <span className="font-semibold text-sm" style={{ color: "var(--k-text)" }}>Menu</span>
                  <button
                    onClick={() => setDrawerOpen(false)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg"
                    style={{ color: "var(--k-text-subtle)" }}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Pozycje nawigacji */}
                <div className="flex-1 overflow-auto py-2 px-3">
                  {drawerItems.map((item) => {
                    const isActive = location.pathname === item.url;
                    return (
                      <Link
                        key={item.title}
                        to={item.url}
                        onClick={() => setDrawerOpen(false)}
                        className="flex items-center gap-3 px-3 py-3 rounded-xl mb-0.5"
                        style={
                          isActive
                            ? { backgroundColor: "var(--k-bg-active)", color: "var(--k-accent-dark)" }
                            : { color: "var(--k-text-muted)" }
                        }
                      >
                        <item.icon
                          className="w-4.5 h-4.5 flex-shrink-0"
                          style={{ color: isActive ? "var(--k-accent)" : "var(--k-text-subtle)" }}
                        />
                        <span className="text-sm font-medium flex-1">{item.title}</span>
                        {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-40" />}
                      </Link>
                    );
                  })}

                  {/* Separator */}
                  <div className="my-3 mx-2 border-t" style={{ borderColor: "var(--k-border)" }} />

                  {/* Motyw */}
                  <div className="px-3 py-2">
                    <p className="text-xs mb-2 font-medium" style={{ color: "var(--k-text-subtle)" }}>Motyw</p>
                    <div className="flex flex-wrap gap-2">
                      {THEMES.map(t => (
                        <button
                          key={t.id}
                          onClick={() => switchTheme(t.id)}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border"
                          style={
                            activeTheme === t.id
                              ? { backgroundColor: "var(--k-bg-active)", color: "var(--k-accent-dark)", borderColor: "var(--k-accent)" }
                              : { color: "var(--k-text-muted)", borderColor: "var(--k-border-md)" }
                          }
                        >
                          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: t.dot }} />
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Profil na dole drawera */}
                <div className="border-t p-4" style={{ borderColor: "var(--k-border)" }}>
                  <Link
                    to={createPageUrl("Profile")}
                    onClick={() => setDrawerOpen(false)}
                    className="flex items-center gap-3"
                  >
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: "var(--k-accent-light)" }}
                    >
                      <span className="font-semibold text-sm" style={{ color: "var(--k-accent-dark)" }}>
                        {user ? getInitials(user.full_name) : "?"}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate" style={{ color: "var(--k-text)" }}>
                        {user?.full_name || "Profil"}
                      </p>
                      <p className="text-xs truncate" style={{ color: "var(--k-text-subtle)" }}>
                        {user?.email || "Ustawienia konta"}
                      </p>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Treść — height:0 + flex-1 wymusza obliczalną wysokość (trick dla flex chat UI) */}
          <div className="flex-1 flex flex-col overflow-auto min-w-0 pb-20 md:pb-0" style={{ height: 0 }}>
            {children}
          </div>
        </main>
      </div>

      {/* ====== DOLNA NAWIGACJA MOBILNA ====== */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 apple-blur border-t"
        style={{ borderColor: "var(--k-border-md)" }}
      >
        {/* Safe area na notch i home indicator */}
        <div className="flex items-end justify-around px-2 pt-2 pb-safe" style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}>

          {/* Pulpit */}
          <MobileNavItem
            to={createPageUrl("Dashboard")}
            icon={Home}
            label="Pulpit"
            active={location.pathname === createPageUrl("Dashboard") || location.pathname === "/"}
          />

          {/* Projekty */}
          <MobileNavItem
            to={createPageUrl("Projects")}
            icon={FolderOpen}
            label="Projekty"
            active={location.pathname === createPageUrl("Projects")}
          />

          {/* FAB — Skanuj (środkowy, uniesiony) */}
          <Link
            to={createPageUrl("Upload")}
            className="relative -top-4 flex flex-col items-center"
          >
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center apple-shadow-lg"
              style={{
                background: "linear-gradient(135deg, var(--k-accent), var(--k-accent-dark))",
              }}
            >
              <Camera className="w-6 h-6" style={{ color: "var(--k-accent-text)", strokeWidth: 2 }} />
            </div>
            <span className="text-xs mt-1 font-medium" style={{ color: "var(--k-accent-dark)" }}>Skanuj</span>
          </Link>

          {/* Asystent */}
          <MobileNavItem
            to={createPageUrl("Assistant")}
            icon={MessageSquare}
            label="Asystent"
            active={location.pathname === createPageUrl("Assistant")}
          />

          {/* Więcej — otwiera drawer */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="flex flex-col items-center gap-1 px-3 py-1 min-w-[3rem]"
          >
            <MoreHorizontal
              className="w-5 h-5"
              style={{ color: "var(--k-text-subtle)", strokeWidth: 1.6 }}
            />
            <span className="text-xs font-medium" style={{ color: "var(--k-text-subtle)" }}>
              Więcej
            </span>
          </button>
        </div>
      </nav>
    </SidebarProvider>
  );
}

// Komponent pojedynczej pozycji w dolnej nawigacji
function MobileNavItem({ to, icon: Icon, label, active }) {
  return (
    <Link to={to} className="flex flex-col items-center gap-1 px-3 py-1 min-w-[3rem]">
      <Icon
        className="w-5 h-5"
        style={{
          color: active ? "var(--k-accent)" : "var(--k-text-subtle)",
          strokeWidth: active ? 2 : 1.6,
        }}
      />
      <span
        className="text-xs font-medium"
        style={{ color: active ? "var(--k-accent)" : "var(--k-text-subtle)" }}
      >
        {label}
      </span>
    </Link>
  );
}
