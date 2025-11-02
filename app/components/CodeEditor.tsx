'use client'

import { useState, useEffect } from "react";
import { Button } from "@/app/components/ui/button";
import dynamic from 'next/dynamic'

// Dynamically import Monaco Editor to avoid SSR issues
const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading editor...</div>
})

interface CodeEditorProps {
  fileId: string;
  initialContent: string;
  language: string;
  onContentChange: (content: string) => void;
}

export function CodeEditor({ fileId, initialContent, language, onContentChange }: CodeEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setContent(initialContent);
  }, [initialContent]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch(`/api/files/${fileId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, language }),
      });
    } catch (error) {
      console.error("Error saving file:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleEditorChange = (value: string | undefined) => {
    setContent(value || '');
    onContentChange(value || '');
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-2 bg-gray-100 border-b border-gray-200">
        <h2 className="text-sm font-medium">File ID: {fileId}</h2>
        <Button onClick={handleSave} size="sm" disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </Button>
      </div>
      <MonacoEditor
        height="100%"
        language={language === 'typescript' ? 'typescript' : 'javascript'}
        theme="vs-light"
        value={content}
        onChange={handleEditorChange}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          automaticLayout: true,
        }}
      />
    </div>
  );
}
