
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
    Camera,
    User as UserIcon,
    ShieldCheck,
    FileText,
    Users,
    StickyNote
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
  {
    title: "Pulpit",
    url: createPageUrl("Dashboard"),
    icon: Home,
  },
  {
    title: "Projekty",
    url: createPageUrl("Projects"),
    icon: FolderOpen,
  },
  {
    title: "Dokumenty",
    url: createPageUrl("Documents"),
    icon: FileText,
  },
  {
    title: "Gwarancje",
    url: createPageUrl("Warranties"),
    icon: ShieldCheck,
  },
  {
    title: "Dodaj dokument",
    url: createPageUrl("Upload"),
    icon: Upload,
  },
  {
    title: "Szukaj",
    url: createPageUrl("Search"),
    icon: Search,
  },
  {
    title: "Notatki",
    url: "/notes",
    icon: StickyNote,
  },
  {
    title: "Zespół",
    url: createPageUrl("Team"),
    icon: Users,
  },
  {
    title: "Profil",
    url: createPageUrl("Profile"),
    icon: UserIcon,
  }
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

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

  return (
    <SidebarProvider>
      <style>
        {`
          :root {
            --primary: #1c1917;
            --primary-foreground: #fafaf9;
            --secondary: #f5f0e8;
            --secondary-foreground: #1c1917;
            --muted: #f5f0e8;
            --muted-foreground: #78716c;
            --accent: #d97706;
            --accent-foreground: #ffffff;
            --background: #faf8f4;
            --foreground: #1c1917;
            --border: #e8e0d4;
            --card: #fffdf9;
            --card-foreground: #1c1917;
            --input: #e8e0d4;
            --ring: #d97706;
          }

          * {
            font-feature-settings: "cv11", "ss01";
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            text-rendering: optimizeLegibility;
          }

          body {
            font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif;
            background-color: #f8f5ef;
            color: #1c1917;
          }

          /* Warm glass — jak papier washi, nie zimne biuro */
          .apple-blur {
            backdrop-filter: saturate(160%) blur(24px);
            -webkit-backdrop-filter: saturate(160%) blur(24px);
            background: rgba(255, 252, 244, 0.88);
            border: 1px solid rgba(200, 180, 140, 0.22);
          }

          /* Ciepłe cienie — piasek i bursztyn zamiast czerni */
          .apple-shadow {
            box-shadow:
              0 1px 2px rgba(100, 70, 20, 0.06),
              0 4px 12px rgba(100, 70, 20, 0.07),
              0 0 0 1px rgba(200, 170, 110, 0.08);
          }

          .apple-shadow-lg {
            box-shadow:
              0 2px 8px rgba(100, 70, 20, 0.08),
              0 12px 32px rgba(100, 70, 20, 0.10),
              0 0 0 1px rgba(200, 170, 110, 0.10);
          }

          /* Gradient ciepłego bursztynu — do przycisków akcji */
          .renovation-gradient {
            background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
            color: #ffffff;
            border: none;
          }
          .renovation-gradient:hover {
            background: linear-gradient(135deg, #b45309 0%, #92400e 100%);
          }

          /* Subtelna ciepła ramka wokół inputów */
          input:focus, textarea:focus {
            outline: none;
            border-color: #d97706 !important;
            box-shadow: 0 0 0 3px rgba(217, 119, 6, 0.12) !important;
          }

          /* Tło stron — ciepła kremowa biel */
          .bg-gray-50 {
            background-color: #f8f5ef !important;
          }

          /* Scrollbar — dyskretny i ciepły */
          ::-webkit-scrollbar { width: 5px; height: 5px; }
          ::-webkit-scrollbar-track { background: transparent; }
          ::-webkit-scrollbar-thumb { background: rgba(180, 140, 80, 0.25); border-radius: 99px; }
          ::-webkit-scrollbar-thumb:hover { background: rgba(180, 140, 80, 0.45); }

          /* Płynne przejścia */
          a, button { transition: all 0.18s ease; }
        `}
      </style>
      <div className="min-h-screen flex w-full" style={{ backgroundColor: '#f8f5ef' }}>
        <Sidebar className="border-r" style={{ borderColor: '#e8ddd0', backgroundColor: '#fdfaf5' }}>
          <SidebarHeader className="border-b p-6" style={{ borderColor: '#ede5d8' }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #92400e 0%, #d97706 100%)' }}>
                <Hammer className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="font-semibold text-base" style={{ color: '#1c1917' }}>Kengo</h2>
                <p className="text-xs font-normal" style={{ color: '#a8956e' }}>Asystent remontu</p>
              </div>
            </div>
          </SidebarHeader>

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
                          style={isActive
                            ? { backgroundColor: '#fdf3e0', color: '#92400e' }
                            : { color: '#6b5c47' }
                          }
                        >
                          <Link to={item.url} className="flex items-center gap-3 px-3 py-2">
                            <item.icon className="w-4 h-4" style={isActive ? { color: '#d97706' } : {}} />
                            <span className="text-sm">{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup className="mt-auto p-4">
              <div className="p-4 rounded-xl text-center" style={{ backgroundColor: '#fef9ec', border: '1px solid #f0d9a0' }}>
                <h4 className="font-semibold text-sm" style={{ color: '#78350f' }}>Wersja Beta</h4>
                <p className="text-xs mt-1 mb-3" style={{ color: '#92400e', opacity: 0.8 }}>Daj znać co myślisz — każda opinia ma znaczenie.</p>
                <button
                  className="text-xs font-semibold rounded-full px-4 py-1.5"
                  style={{ background: 'linear-gradient(135deg, #d97706, #b45309)', color: '#fff' }}
                >
                  Wyślij opinię
                </button>
              </div>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t p-4" style={{ borderColor: '#ede5d8' }}>
            <Link to={createPageUrl("Profile")} className="flex items-center gap-3 p-2 -m-2 rounded-lg" style={{ ':hover': { backgroundColor: '#f5f0e8' } }}>
              {isLoadingUser ? (
                <>
                  <Skeleton className="w-8 h-8 rounded-full" />
                  <div className="flex-1 min-w-0">
                    <Skeleton className="h-4 w-20 mb-1" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </>
              ) : user ? (
                <>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#f0e6d0' }}>
                    <span className="font-medium text-sm" style={{ color: '#92400e' }}>{getInitials(user.full_name)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate" style={{ color: '#1c1917' }}>{user.full_name || 'Użytkownik'}</p>
                    <p className="text-xs truncate" style={{ color: '#a8956e' }}>{user.email}</p>
                  </div>
                </>
              ) : (
                <p className="text-sm" style={{ color: '#a8956e' }}>Nie zalogowano</p>
              )}
            </Link>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col" style={{ backgroundColor: '#f8f5ef' }}>
          <header className="apple-blur border-b px-4 py-3 md:hidden" style={{ borderColor: '#ede5d8' }}>
            <div className="flex items-center gap-4">
              <SidebarTrigger className="p-2 rounded-lg" style={{ color: '#1c1917' }} />
              <h1 className="text-lg font-medium" style={{ color: '#1c1917' }}>Kengo</h1>
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
