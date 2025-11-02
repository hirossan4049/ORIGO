'use client'

import { signOut } from "next-auth/react";
import { Icons } from "@/app/components/ui/icons";
import { Button } from "@/app/components/ui/button";

interface AppHeaderProps {
  onSettingsClick: () => void;
  onRunClick?: () => void;
  projectName?: string;
}

export function AppHeader({ onSettingsClick, onRunClick, projectName }: AppHeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-10 flex items-center justify-between h-14 px-4 bg-white border-b border-gray-200">
      <div className="flex items-center gap-2">
        <Icons.logo className="w-6 h-6 text-blue-600" />
        <span className="font-semibold text-gray-900">{projectName || "ORIGO"}</span>
      </div>
      <div className="flex items-center gap-2">
        {onRunClick && (
          <Button variant="outline" size="sm" onClick={onRunClick}>
            <Icons.play className="w-4 h-4 mr-2" />
            Run
          </Button>
        )}
        <Button variant="outline" size="sm" onClick={onSettingsClick}>
          <Icons.settings className="w-4 h-4 mr-2" />
          Settings
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          <Icons.logout className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>
    </header>
  );
}
