'use client'

import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/app/components/AppLayout";
import { CodeEditor } from "@/app/components/CodeEditor";
import { ExecutionPanel } from "@/app/components/ExecutionPanel";

interface FileData {
  name: string;
  content: string;
  language: string;
  runtime: string;
  projectId: string;
  project: { name: string };
}

export default function FilePage({ params }: { params: { id: string } }) {
  const [file, setFile] = useState<FileData | null>(null);
  const [content, setContent] = useState("");
  const [functionNames, setFunctionNames] = useState<string[]>(["main"]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"editor" | "execution">("editor");
  const executionPanelRef = useRef<{ runMainFunction: () => void }>(null);
  const { status } = useSession();
  const router = useRouter();

  const fetchFile = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/files/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setFile(data.file);
        setContent(data.file.content);
      } else {
        setFile(null);
      }
    } catch (error) {
      console.error("Error fetching file:", error);
      setFile(null);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchFile();
    }
  }, [status, fetchFile]);

  useEffect(() => {
    // Simple regex to extract function names
    const regex = /(?:function\s+)(\w+)\s*\(|(?:const|let|var)\s+(\w+)\s*=\s*\([^)]*\)\s*=>/g;
    let match;
    const names: string[] = ["main"]; // Default function
    while ((match = regex.exec(content)) !== null) {
      if (match[1]) names.push(match[1]);
      if (match[2]) names.push(match[2]);
    }
    setFunctionNames(Array.from(new Set(names))); // Remove duplicates
  }, [content]);

  const handleRunClick = useCallback(() => {
    setActiveTab("execution");
    if (executionPanelRef.current) {
      executionPanelRef.current.runMainFunction();
    }
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return <div className="p-6">Loading...</div>;
  }

  if (status !== "authenticated") {
    return null;
  }

  if (loading) {
    return <AppLayout><div className="p-6">Loading...</div></AppLayout>;
  }

  if (!file) {
    return <AppLayout><div className="p-6">File not found</div></AppLayout>;
  }

  return (
    <AppLayout onRunClick={handleRunClick} projectId={file.projectId} projectName={file.project.name}>
      <div className="h-[calc(100vh-3.5rem)] flex flex-col">
        <div className="flex-none border-b border-gray-200">
          <div className="flex">
            <button
              className={`py-2 px-4 text-sm font-medium ${activeTab === "editor" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
              onClick={() => setActiveTab("editor")}
            >
              Code Editor
            </button>
            <button
              className={`py-2 px-4 text-sm font-medium ${activeTab === "execution" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
              onClick={() => setActiveTab("execution")}
            >
              Execution Panel
            </button>
          </div>
        </div>
        <div className="flex-1">
          {activeTab === "editor" && (
            <CodeEditor fileId={params.id} initialContent={content} language={file.language} onContentChange={setContent} />
          )}
          {activeTab === "execution" && (
            <ExecutionPanel fileId={params.id} functionNames={functionNames} fileRuntime={file.runtime} ref={executionPanelRef} />
          )}
        </div>
      </div>
    </AppLayout>
  );
}
