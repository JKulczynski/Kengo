import React, { Suspense, useEffect } from 'react';
import Layout from "./Layout.jsx";
import { Route, Routes, useLocation } from 'react-router-dom';
import { trackPageView } from '@/lib/analytics';

// Code splitting — każda strona ładuje się osobno
const Dashboard    = React.lazy(() => import('./Dashboard'));
const Upload       = React.lazy(() => import('./Upload'));
const Projects     = React.lazy(() => import('./Projects'));
const Search       = React.lazy(() => import('./Search'));
const Profile      = React.lazy(() => import('./Profile'));
const Warranties   = React.lazy(() => import('./Warranties'));
const Documents    = React.lazy(() => import('./Documents'));
const Assistant    = React.lazy(() => import('./Assistant'));
const ProjectDetail = React.lazy(() => import('./ProjectDetail'));
const Team         = React.lazy(() => import('./Team'));
const Notes        = React.lazy(() => import('./Notes'));

// Minimalistyczny loader — pasuje do japońskiego designu
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-full" style={{ backgroundColor: 'var(--k-bg)' }}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: 'var(--k-border-strong)', borderTopColor: 'var(--k-accent)' }} />
        <p className="text-sm" style={{ color: 'var(--k-text-subtle)' }}>Ładuję...</p>
      </div>
    </div>
  );
}

function PagesContent() {
  const location = useLocation();

  useEffect(() => {
    trackPageView(location.pathname);
  }, [location.pathname]);

  return (
    <Layout>
      <div key={location.pathname} className="page-transition flex-1 min-w-0">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/"              element={<Dashboard />} />
            <Route path="/Dashboard"     element={<Dashboard />} />
            <Route path="/Upload"        element={<Upload />} />
            <Route path="/Projects"      element={<Projects />} />
            <Route path="/Search"        element={<Search />} />
            <Route path="/Profile"       element={<Profile />} />
            <Route path="/Warranties"    element={<Warranties />} />
            <Route path="/Documents"     element={<Documents />} />
            <Route path="/Assistant"     element={<Assistant />} />
            <Route path="/ProjectDetail" element={<ProjectDetail />} />
            <Route path="/project/:projectId" element={<ProjectDetail />} />
            <Route path="/Team"          element={<Team />} />
            <Route path="/notes"         element={<Notes />} />
          </Routes>
        </Suspense>
      </div>
    </Layout>
  );
}

export default function Pages() {
  return <PagesContent />;
}
