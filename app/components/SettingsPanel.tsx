'use client'

import { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Icons } from "@/app/components/ui/icons";
import { TriggersTab } from "./TriggersTab";
import { EnvVarsTab } from "./EnvVarsTab";
import { LocalStorageTab } from "./LocalStorageTab";

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  projectId?: string;
}

export function SettingsPanel({ isOpen, onClose, projectId }: SettingsPanelProps) {
  const [activeTab, setActiveTab] = useState("triggers");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 bg-white">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold">Project Settings</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <Icons.close className="w-4 h-4" />
        </Button>
      </div>
      <div className="flex h-[calc(100vh-3.5rem)]">
        <div className="w-64 border-r p-4 space-y-2">
          <Button variant={activeTab === "triggers" ? "secondary" : "ghost"} onClick={() => setActiveTab("triggers")} className="w-full justify-start">
            Triggers
          </Button>
          <Button variant={activeTab === "env-vars" ? "secondary" : "ghost"} onClick={() => setActiveTab("env-vars")} className="w-full justify-start">
            Environment Variables
          </Button>
          <Button variant={activeTab === "local-storage" ? "secondary" : "ghost"} onClick={() => setActiveTab("local-storage")} className="w-full justify-start">
            Local Storage
          </Button>
        </div>
        <div className="flex-1 p-6 overflow-y-auto">
          {activeTab === "triggers" && <TriggersTab projectId={projectId} />}
          {activeTab === "env-vars" && <EnvVarsTab projectId={projectId} />}
          {activeTab === "local-storage" && <LocalStorageTab projectId={projectId} />}
        </div>
      </div>
    </div>
  );
}
