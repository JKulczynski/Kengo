
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
            --primary: #000000;
            --primary-foreground: #ffffff;
            --secondary: #f5f5f7;
            --secondary-foreground: #1d1d1f;
            --muted: #f5f5f7;
            --muted-foreground: #86868b;
            --accent: #007aff;
            --accent-foreground: #ffffff;
            --background: #ffffff;
            --foreground: #1d1d1f;
            --border: #d2d2d7;
            --card: #ffffff;
            --card-foreground: #1d1d1f;
        }
        
        /* Wymuszenie trybu jasnego - usuwamy @media (prefers-color-scheme: dark) */
        
        * {
          font-feature-settings: "cv11", "ss01";
          -webkit-font-smoothing: antialiased;
          text-rendering: optimizeLegibility;
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Icons", "Helvetica Neue", Helvetica, Arial, sans-serif;
          background-color: #ffffff;
          color: #1d1d1f;
        }
        
        .apple-blur {
          backdrop-filter: saturate(180%) blur(20px);
          background: rgba(255, 255, 255, 0.72);
          border: 1px solid rgba(0, 0, 0, 0.04);
        }
        
        .apple-shadow {
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        .apple-shadow-lg {
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
        }
        `}
      </style>
      <div className="min-h-screen flex w-full bg-white">
        <Sidebar className="border-r border-gray-200 bg-white">
          <SidebarHeader className="border-b border-gray-100 p-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                <Hammer className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="font-semibold text-black text-base">RenovateAI</h2>
                <p className="text-xs text-gray-500 font-normal">Asystent remontu</p>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="p-2">
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        className={`mx-1 rounded-lg transition-all duration-200 font-normal ${
                          location.pathname === item.url 
                            ? 'bg-gray-100 text-black' 
                            : 'text-gray-600 hover:text-black hover:bg-gray-50'
                        }`}
                      >
                        <Link to={item.url} className="flex items-center gap-3 px-3 py-2">
                          <item.icon className="w-4 h-4" />
                          <span className="text-sm">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup className="mt-auto p-4">
              <div className="p-4 rounded-lg bg-blue-500/10 text-center">
                  <h4 className="font-semibold text-blue-800">Przejdź na Pro</h4>
                  <p className="text-xs text-blue-600 mt-1 mb-3">Odblokuj współpracę zespołową, raporty i więcej.</p>
                  <button className="text-xs font-bold text-white bg-blue-500 rounded-full px-4 py-1.5 hover:bg-blue-600">Dowiedz się więcej</button>
              </div>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-gray-100 p-4">
            <Link to={createPageUrl("Profile")} className="flex items-center gap-3 p-2 -m-2 rounded-lg hover:bg-gray-50">
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
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="text-gray-600 font-medium text-sm">{getInitials(user.full_name)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-black text-sm truncate">{user.full_name || 'User'}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                </>
              ) : (
                <p className="text-sm text-gray-500">Nie zalogowano</p>
              )}
            </Link>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col bg-white">
          <header className="apple-blur border-b border-gray-100 px-4 py-3 md:hidden">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-gray-100 p-2 rounded-lg transition-colors duration-200 text-black" />
              <h1 className="text-lg font-medium text-black">RenovateAI</h1>
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
