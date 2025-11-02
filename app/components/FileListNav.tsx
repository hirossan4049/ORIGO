'use client'

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icons } from "@/app/components/ui/icons";

interface File {
  id: string;
  name: string;
}

interface FileListNavProps {
  projectId: string;
}

export function FileListNav({ projectId }: FileListNavProps) {
  const [files, setFiles] = useState<File[]>([]);
  const pathname = usePathname();

  const fetchFiles = useCallback(async () => {
    if (!projectId) return;
    try {
      const response = await fetch(`/api/projects/${projectId}`);
      if (response.ok) {
        const data = await response.json();
        setFiles(data.project.files || []);
      }
    } catch (error) {
      console.error("Error fetching files:", error);
    }
  }, [projectId]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  return (
    <aside className="fixed top-14 left-64 w-64 h-[calc(100vh-3.5rem)] bg-gray-100 border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-semibold text-gray-800">Files</h3>
      </div>
      <div className="flex-1 overflow-y-auto">
        <nav className="p-2 space-y-1">
          {files.length === 0 ? (
            <p className="px-3 py-2 text-sm text-gray-500">No files yet.</p>
          ) : (
            files.map((file) => {
              const href = `/files/${file.id}`;
              const active = pathname === href;

              return (
                <Link
                  href={href}
                  key={file.id}
                  className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                    active
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <Icons.file className="w-5 h-5" />
                  <span className="truncate">{file.name}</span>
                </Link>
              );
            })
          )}
        </nav>
      </div>
    </aside>
  );
}
