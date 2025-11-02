'use client'

import { useEffect, useState, useCallback } from "react";
import { Icons } from "@/app/components/ui/icons";
import Link from "next/link";

interface File {
  id: string;
  name: string;
}

interface FileListNavProps {
  projectId: string;
}

export function FileListNav({ projectId }: FileListNavProps) {
  const [files, setFiles] = useState<File[]>([]);

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
    <aside className="fixed top-14 left-64 w-64 h-full bg-gray-100 border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-semibold">Files</h3>
      </div>
      <div className="flex-1 overflow-y-auto">
        <nav className="p-2 space-y-1">
          {files.map((file) => (
            <Link href={`/files/${file.id}`} key={file.id}>
              <div className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-200 cursor-pointer">
                <Icons.file className="w-5 h-5" />
                <span className="text-sm">{file.name}</span>
              </div>
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
}
