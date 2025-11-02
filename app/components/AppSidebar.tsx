'use client'

import { useEffect, useState, useCallback } from "react";
import { Icons } from "@/app/components/ui/icons";
import { Button } from "@/app/components/ui/button";
import { CreateProjectDialog } from "@/app/components/CreateProjectDialog";
import { CreateFileDialog } from "@/app/components/CreateFileDialog";
import { ProjectContextMenu } from "@/app/components/ProjectContextMenu";
import { FileContextMenu } from "@/app/components/FileContextMenu";
import Link from "next/link";

interface File {
  id: string;
  name: string;
}

interface Project {
  id: string;
  name: string;
  files: File[];
}

interface ProjectContextMenuData {
  x: number;
  y: number;
  projectId: string;
}

interface FileContextMenuData {
  x: number;
  y: number;
  fileId: string;
}

export function AppSidebar() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [openProjectId, setOpenProjectId] = useState<string | null>(null);
  const [isCreateProjectOpen, setCreateProjectOpen] = useState(false);
  const [isCreateFileOpen, setCreateFileOpen] = useState(false);
  const [projectContextMenu, setProjectContextMenu] = useState<ProjectContextMenuData | null>(null);
  const [fileContextMenu, setFileContextMenu] = useState<FileContextMenuData | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");

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
    const handleClick = () => {
      setProjectContextMenu(null);
      setFileContextMenu(null);
    };
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, [fetchProjects]);

  const toggleProject = (projectId: string) => {
    setOpenProjectId(openProjectId === projectId ? null : projectId);
  };

  const handleProjectContextMenu = (e: React.MouseEvent, projectId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setFileContextMenu(null);
    setProjectContextMenu({ x: e.clientX, y: e.clientY, projectId });
  };

  const handleFileContextMenu = (e: React.MouseEvent, fileId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setProjectContextMenu(null);
    setFileContextMenu({ x: e.clientX, y: e.clientY, fileId });
  };

  const handleAddFile = () => {
    if (projectContextMenu) {
      setSelectedProjectId(projectContextMenu.projectId);
      setCreateFileOpen(true);
    }
  };

  const handleDeleteProject = async () => {
    if (projectContextMenu) {
      if (confirm("Are you sure you want to delete this project?")) {
        try {
          await fetch(`/api/projects/${projectContextMenu.projectId}`, { method: "DELETE" });
          fetchProjects();
        } catch (error) {
          console.error("Error deleting project:", error);
        }
      }
    }
  };

  const handleDeleteFile = async () => {
    if (fileContextMenu) {
      if (confirm("Are you sure you want to delete this file?")) {
        try {
          await fetch(`/api/files/${fileContextMenu.fileId}`, { method: "DELETE" });
          fetchProjects();
        } catch (error) {
          console.error("Error deleting file:", error);
        }
      }
    }
  };

  return (
    <>
      <aside className="fixed top-14 left-0 w-64 h-full bg-gray-50 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <Button className="w-full" onClick={() => setCreateProjectOpen(true)}>
            <Icons.add className="w-4 h-4 mr-2" />
            New Project
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <nav className="p-2 space-y-1">
            {projects.map((project) => (
              <div key={project.id} onContextMenu={(e) => handleProjectContextMenu(e, project.id)}>
                <div 
                  className="flex items-center justify-between p-2 rounded-md hover:bg-gray-200 cursor-pointer"
                  onClick={() => toggleProject(project.id)}
                >
                  <div className="flex items-center gap-2">
                    {openProjectId === project.id ? (
                      <Icons.chevronDown className="w-4 h-4" />
                    ) : (
                      <Icons.chevronRight className="w-4 h-4" />
                    )}
                    <Icons.folder className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-sm">{project.name}</span>
                  </div>
                </div>
                {openProjectId === project.id && (
                  <div className="pl-6 mt-1 space-y-1">
                    {project.files.map((file) => (
                      <Link href={`/files/${file.id}`} key={file.id} passHref>
                        <div onContextMenu={(e) => handleFileContextMenu(e, file.id)} className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-200">
                          <Icons.file className="w-5 h-5" />
                          <span className="text-sm">{file.name}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>
      </aside>
      <CreateProjectDialog
        isOpen={isCreateProjectOpen}
        onClose={() => setCreateProjectOpen(false)}
        onProjectCreated={fetchProjects}
      />
      {selectedProjectId && (
        <CreateFileDialog
          isOpen={isCreateFileOpen}
          onClose={() => setCreateFileOpen(false)}
          onFileCreated={fetchProjects}
          projectId={selectedProjectId}
        />
      )}
      {projectContextMenu && (
        <ProjectContextMenu
          x={projectContextMenu.x}
          y={projectContextMenu.y}
          onClose={() => setProjectContextMenu(null)}
          onAddFile={handleAddFile}
          onDeleteProject={handleDeleteProject}
        />
      )}
      {fileContextMenu && (
        <FileContextMenu
          x={fileContextMenu.x}
          y={fileContextMenu.y}
          onClose={() => setFileContextMenu(null)}
          onDeleteFile={handleDeleteFile}
        />
      )}
    </>
  );
}
