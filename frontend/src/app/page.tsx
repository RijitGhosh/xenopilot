"use client";

import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { Megaphone, Users, BarChart3, LayoutDashboard, Sparkles, Moon, Sun, PanelLeftClose, PanelLeftOpen, ShieldCheck } from 'lucide-react';

// Import our custom components
import Dashboard from '../components/Dashboard';
import Builder from '../components/Builder';
import Customers from '../components/Customers';
import Campaigns from '../components/Campaigns';
import Analytics from '../components/Analytics';
import { API_URL } from '../lib/api';

// Global query client will be instantiated client-side in RootPage

function MainAppContent() {
  const [currentPage, setCurrentPage] = useState<string>('dashboard');
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);

  // Synchronize dark mode class with root html
  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [darkMode]);

  // Query analytics aggregates from the Express API
  const { data: analytics, isLoading, isError, refetch } = useQuery({
    queryKey: ['analyticsData'],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/api/analytics`);
      if (!response.ok) {
        throw new Error('Network error fetching analytics aggregates');
      }
      return response.json();
    },
  });

  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'builder', name: 'AI Builder', icon: Sparkles },
    { id: 'customers', name: 'Customers CRM', icon: Users },
    { id: 'campaigns', name: 'Campaign Tracker', icon: Megaphone },
    { id: 'analytics', name: 'Analytics Portal', icon: BarChart3 },
  ];

  const renderActivePage = () => {
    console.log("isLoading:", isLoading);
    console.log("analytics:", analytics);
    console.log("isError:", isError);

    if (isError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4 text-center animate-fadeIn">
          <div className="text-rose-500 text-lg font-bold">Connection Failed to API Backend</div>
          <p className="text-slate-550 dark:text-slate-400 text-sm max-w-md">
            XenoPilot could not fetch analytics data from <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded font-mono">http://localhost:5000</code>. 
            Please verify your backend server is running and accessible.
          </p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-sm shadow cursor-pointer transition"
          >
            Retry Connection
          </button>
        </div>
      );
    }

    try {
      switch (currentPage) {
        case 'dashboard':
          return <Dashboard analytics={analytics} isLoading={isLoading} onNavigate={setCurrentPage} />;
        case 'builder':
          return <Builder onNavigate={setCurrentPage} refetchAnalytics={refetch} />;
        case 'customers':
          return <Customers />;
        case 'campaigns':
          return <Campaigns />;
        case 'analytics':
          return <Analytics analytics={analytics} isLoading={isLoading} />;
        default:
          return <Dashboard analytics={analytics} isLoading={isLoading} onNavigate={setCurrentPage} />;
      }
    } catch (err: any) {
      console.error("Render crash in page:", currentPage, err);
      return (
        <div className="p-6 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/40 rounded-xl text-rose-800 dark:text-rose-400">
          <h3 className="font-bold text-lg">Component Render Crash ({currentPage})</h3>
          <p className="text-sm mt-1">{err.message || String(err)}</p>
          <pre className="text-xs bg-rose-100/50 dark:bg-rose-955/20 p-3 rounded-lg mt-3 overflow-x-auto font-mono">{err.stack || "No stack trace available."}</pre>
        </div>
      );
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-300 font-sans">
      {/* SIDEBAR NAVIGATION */}
      <aside className={`${
        sidebarOpen ? 'w-64' : 'w-20'
      } bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 flex flex-col z-20`}>
        {/* Sidebar Brand Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5 overflow-hidden">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0">XP</div>
            {sidebarOpen && <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">XenoPilot</span>}
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-slate-500 cursor-pointer"
          >
            {sidebarOpen ? <PanelLeftClose className="w-4.5 h-4.5" /> : <PanelLeftOpen className="w-4.5 h-4.5" />}
          </button>
        </div>

        {/* Sidebar Menu Items */}
        <nav className="flex-1 p-4 space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`w-full flex items-center space-x-3.5 px-3.5 py-3 rounded-xl text-sm font-medium transition cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && <span>{item.name}</span>}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer Controls */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
          {/* Dark Mode toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="w-full flex items-center space-x-3.5 px-3.5 py-2.5 rounded-lg text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50 cursor-pointer"
          >
            {darkMode ? <Sun className="w-4.5 h-4.5 text-amber-500" /> : <Moon className="w-4.5 h-4.5" />}
            {sidebarOpen && <span>{darkMode ? 'Light Theme' : 'Dark Theme'}</span>}
          </button>

          {/* Dev info badge */}
          {sidebarOpen && (
            <div className="flex items-center space-x-2 text-[10px] text-slate-400 font-bold bg-slate-50 dark:bg-slate-950 p-2 border border-slate-150 dark:border-slate-850 rounded-lg">
              <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span>Pilot Agent Running</span>
            </div>
          )}
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto p-8 md:p-10">
        <div className="max-w-6xl mx-auto">
          {renderActivePage()}
        </div>
      </main>
    </div>
  );
}

export default function RootPage() {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <MainAppContent />
    </QueryClientProvider>
  );
}
