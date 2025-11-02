'use client'

import { useEffect, useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Icons } from "@/app/components/ui/icons";
import { Button } from "@/app/components/ui/button";
import { CreateProjectDialog } from "@/app/components/CreateProjectDialog";

interface Project {
  id: string;
  name: string;
}

export function ProjectListNav() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const pathname = usePathname();

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

  const handleProjectCreated = useCallback(() => {
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const baseNavItems = [
    { href: "/dashboard", label: "Dashboard", icon: Icons.dashboard },
    { href: "/files", label: "Files", icon: Icons.file },
    { href: "/schedules", label: "Schedules", icon: Icons.clock },
  ];

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      <aside className="fixed top-14 left-0 w-64 h-[calc(100vh-3.5rem)] bg-gray-50 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <Button className="w-full" onClick={() => setDialogOpen(true)}>
            <Icons.add className="w-4 h-4 mr-2" />
            New Project
          </Button>
        </div>
        <div className="px-4 py-3 text-xs font-semibold uppercase text-gray-500 tracking-wide">
          Overview
        </div>
        <nav className="px-2 space-y-1">
          {baseNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                isActive(item.href)
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-700 hover:bg-gray-200"
              }`}
            >
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="px-4 py-3 text-xs font-semibold uppercase text-gray-500 tracking-wide">
          Projects
        </div>
        <div className="flex-1 overflow-y-auto">
          <nav className="p-2 space-y-1">
            {projects.length === 0 ? (
              <p className="px-3 py-2 text-sm text-gray-500">
                No projects yet.
              </p>
            ) : (
              projects.map((project) => {
                const href = `/projects/${project.id}`;
                const active =
                  pathname === href || pathname.startsWith(`${href}/`);

                return (
                  <Link
                    href={href}
                    key={project.id}
                    className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                      active
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <Icons.folder className="w-5 h-5 text-blue-600" />
                    <span className="font-medium">{project.name}</span>
                  </Link>
                );
              })
            )}
          </nav>
        </div>
      </aside>
      <CreateProjectDialog
        isOpen={isDialogOpen}
        onClose={() => setDialogOpen(false)}
        onProjectCreated={handleProjectCreated}
      />
    </>
  );
}
