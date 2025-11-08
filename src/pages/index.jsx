import Layout from "./Layout.jsx";

import Dashboard from "./Dashboard";

import Upload from "./Upload";

import Projects from "./Projects";

import Search from "./Search";

import Profile from "./Profile";

import Warranties from "./Warranties";

import Documents from "./Documents";

import Assistant from "./Assistant";

import ProjectDetail from "./ProjectDetail";

import Team from "./Team";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Dashboard: Dashboard,
    
    Upload: Upload,
    
    Projects: Projects,
    
    Search: Search,
    
    Profile: Profile,
    
    Warranties: Warranties,
    
    Documents: Documents,
    
    Assistant: Assistant,
    
    ProjectDetail: ProjectDetail,
    
    Team: Team,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Dashboard />} />
                
                
                <Route path="/Dashboard" element={<Dashboard />} />
                
                <Route path="/Upload" element={<Upload />} />
                
                <Route path="/Projects" element={<Projects />} />
                
                <Route path="/Search" element={<Search />} />
                
                <Route path="/Profile" element={<Profile />} />
                
                <Route path="/Warranties" element={<Warranties />} />
                
                <Route path="/Documents" element={<Documents />} />
                
                <Route path="/Assistant" element={<Assistant />} />
                
                <Route path="/ProjectDetail" element={<ProjectDetail />} />
                
                <Route path="/Team" element={<Team />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}