'use client'

import { useState } from "react";
import { AppHeader } from "./AppHeader";
import { AppSidebar } from "./AppSidebar";
import { SettingsPanel } from "./SettingsPanel";

interface AppLayoutProps {
  children: React.ReactNode;
  onRunClick?: () => void;
  projectId?: string;
  projectName?: string; // Add projectName prop
}

export function AppLayout({ children, onRunClick, projectId, projectName }: AppLayoutProps) {
  const [isSettingsOpen, setSettingsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      <AppHeader onSettingsClick={() => setSettingsOpen(true)} onRunClick={onRunClick} projectName={projectName} />
      <AppSidebar />
      <main className="pl-64 pt-14">
        {children}
      </main>
      <SettingsPanel isOpen={isSettingsOpen} onClose={() => setSettingsOpen(false)} projectId={projectId} />
    </div>
  );
}
