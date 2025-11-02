'use client'

import { useState } from "react";
import { AppHeader } from "./AppHeader";
import { ProjectListNav } from "./ProjectListNav";
import { FileListNav } from "./FileListNav";
import { SettingsPanel } from "./SettingsPanel";

interface AppLayoutProps {
  children: React.ReactNode;
  onRunClick?: () => void;
  projectId?: string;
  projectName?: string;
}

export function AppLayout({ children, onRunClick, projectId, projectName }: AppLayoutProps) {
  const [isSettingsOpen, setSettingsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      <AppHeader onSettingsClick={() => setSettingsOpen(true)} onRunClick={onRunClick} projectName={projectName} />
      <ProjectListNav />
      {projectId && <FileListNav projectId={projectId} />}
      <main className={`pt-14 ${projectId ? 'pl-[32rem]' : 'pl-64'}`}>
        {children}
      </main>
      <SettingsPanel isOpen={isSettingsOpen} onClose={() => setSettingsOpen(false)} projectId={projectId} />
    </div>
  );
}
