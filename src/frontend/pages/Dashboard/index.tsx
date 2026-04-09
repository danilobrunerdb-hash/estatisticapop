import React from 'react';
import { useProjectionContext } from '../../context/ProjectionContext';
import { cn } from '@/lib/utils';

// Layout Components
import { Header } from '../../components/layout/Header';
import { Footer } from '../../components/layout/Footer';
import { Sidebar } from '../../components/layout/Sidebar';
import { TopToolbar } from '../../components/layout/TopToolbar';

// Dashboard Tabs
import { OverviewTab } from './OverviewTab';
import { MethodTab } from './MethodTab';

export const Dashboard = () => {
  const { isDarkMode, activeTab } = useProjectionContext();

  return (
    <div className={cn("min-h-screen flex flex-col font-sans selection:bg-green-200 transition-colors duration-500", isDarkMode ? "dark bg-[#0a0f16] text-slate-100" : "bg-[#f4f7f5] text-slate-900")}>

      {/* App Shell Top Header */}
      <Header />

      <main className="flex-1 flex relative">
        {/* Left Sidebar config */}
        <Sidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col relative w-full">
          {/* Navigation & Controls stay fixed at the top */}
          <TopToolbar />

          <div className="flex-1 pb-8">
            {activeTab === 'overview' ? <OverviewTab /> : <MethodTab />}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
