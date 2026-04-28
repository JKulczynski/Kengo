import "./App.css";
import { useState, useEffect } from "react";
import Pages from "@/pages/index.jsx";
import Login from "@/pages/Login.jsx";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "sonner";
import { supabase } from "@/api/apiClient";

function App() {
  const [session, setSession] = useState(undefined); // undefined = loading

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (session === undefined) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "var(--k-bg)" }}
      >
        <div
          className="w-8 h-8 rounded-full border-2 animate-spin"
          style={{
            borderColor: "var(--k-border-strong)",
            borderTopColor: "var(--k-accent)",
          }}
        />
      </div>
    );
  }

  if (!session) {
    return (
      <>
        <Login onLogin={() => {}} />
        <SonnerToaster richColors position="top-right" />
      </>
    );
  }

  return (
    <>
      <Pages />
      <Toaster />
      <SonnerToaster richColors position="top-right" />
    </>
  );
}

export default App;
