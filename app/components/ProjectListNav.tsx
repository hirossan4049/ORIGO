'use client'

import { useEffect, useState, useCallback } from "react";
import { Icons } from "@/app/components/ui/icons";
import { Button } from "@/app/components/ui/button";
import Link from "next/link";

interface Project {
  id: string;
  name: string;
}

export function ProjectListNav() {
  const [projects, setProjects] = useState<Project[]>([]);

  const fetchProjects = useCallback(async () => {
    try {
      const response = await fetch("/api/projects");
      if (response.ok) {
        const data = await response.json();
        setProjects(data.projects || []);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return (
    <aside className="fixed top-14 left-0 w-64 h-full bg-gray-50 border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <Button className="w-full">
          <Icons.add className="w-4 h-4 mr-2" />
          New Project
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto">
        <nav className="p-2 space-y-1">
          {projects.map((project) => (
            <Link href={`/projects/${project.id}`} key={project.id}>
              <div className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-200 cursor-pointer">
                <Icons.folder className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-sm">{project.name}</span>
              </div>
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
}
