'use client'

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/app/components/ui/button";
import { Icons } from "@/app/components/ui/icons";

interface Trigger {
  id: string;
  functionName: string;
  cronExpression: string;
  enabled: boolean;
  file: { name: string };
}

interface ProjectFile {
  id: string;
  name: string;
  content: string;
}

interface TriggersTabProps {
  projectId?: string;
}

const extractFunctionNames = (content: string): string[] => {
  const patterns = [
    /(?:^|\s)(?:export\s+)?(?:default\s+)?(?:async\s+)?function\s+([A-Za-z_$][\w$]*)/g,
    /(?:^|\s)(?:export\s+)?(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?\([^=]*\)\s*=>/g,
    /(?:^|\s)(?:export\s+)?(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?function\b/g,
  ];

  const names = new Set<string>();

  for (const pattern of patterns) {
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(content)) !== null) {
      if (match[1]) {
        names.add(match[1]);
      }
    }
  }

  return Array.from(names);
};

export function TriggersTab({ projectId }: TriggersTabProps) {
  const [triggers, setTriggers] = useState<Trigger[]>([]);
  const [projectFiles, setProjectFiles] = useState<ProjectFile[]>([]);
  const [availableFunctions, setAvailableFunctions] = useState<string[]>([]);
  const [selectedFileId, setSelectedFileId] = useState("");
  const [selectedFunction, setSelectedFunction] = useState("main");
  const [cronExpression, setCronExpression] = useState("*/5 * * * *");
  const [loading, setLoading] = useState(true);

  const fetchTriggers = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/schedules?projectId=${projectId}`);
      if (response.ok) {
        const data = await response.json();
        setTriggers(data.schedules || []);
      }
    } catch (error) {
      console.error("Error fetching triggers:", error);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  const fetchProjectFiles = useCallback(async () => {
    if (!projectId) return;
    try {
      const response = await fetch(`/api/projects/${projectId}`);
      if (response.ok) {
        const data = await response.json();
        setProjectFiles(data.project.files || []);
      }
    } catch (error) {
      console.error("Error fetching project files:", error);
    }
  }, [projectId]);

  useEffect(() => {
    fetchTriggers();
    fetchProjectFiles();
  }, [fetchTriggers, fetchProjectFiles]);

  useEffect(() => {
    const functions = new Set<string>(["main"]);

    if (selectedFileId) {
      const file = projectFiles.find(f => f.id === selectedFileId);
      if (file) {
        extractFunctionNames(file.content).forEach(name => functions.add(name));
      }
    }

    const functionList = Array.from(functions);
    setAvailableFunctions(functionList);
    setSelectedFunction("main");
  }, [selectedFileId, projectFiles]);

  const handleAddTrigger = async () => {
    if (!projectId || !selectedFileId || !selectedFunction || !cronExpression) return;

    try {
      const response = await fetch("/api/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileId: selectedFileId,
          functionName: selectedFunction,
          cronExpression,
        }),
      });
      if (response.ok) {
        fetchTriggers();
      } else {
        console.error("Failed to add trigger");
      }
    } catch (error) {
      console.error("Error adding trigger:", error);
    }
  };

  const handleDeleteTrigger = async (triggerId: string) => {
    if (!confirm("Are you sure you want to delete this trigger?")) return;
    try {
      const response = await fetch(`/api/schedules/${triggerId}`, { method: "DELETE" });
      if (response.ok) {
        fetchTriggers();
      } else {
        console.error("Failed to delete trigger");
      }
    } catch (error) {
      console.error("Error deleting trigger:", error);
    }
  };

  if (!projectId) {
    return <div className="text-gray-600">Select a project to manage triggers.</div>;
  }

  if (loading) {
    return <div>Loading triggers...</div>;
  }

  return (
    <div>
      <div className="border rounded-lg p-4">
        <h3 className="font-semibold mb-2">Add Trigger</h3>
        <div className="flex flex-col gap-4">
          <select
            className="p-2 border rounded-md w-full"
            value={selectedFileId}
            onChange={(e) => setSelectedFileId(e.target.value)}
          >
            <option value="">Select a file</option>
            {projectFiles.map(file => (
              <option key={file.id} value={file.id}>{file.name}</option>
            ))}
          </select>
          <select
            className="p-2 border rounded-md w-full"
            value={selectedFunction}
            onChange={(e) => setSelectedFunction(e.target.value)}
          >
            {availableFunctions.map(funcName => (
              <option key={funcName} value={funcName}>{funcName}</option>
            ))}
          </select>
          <select
            className="p-2 border rounded-md w-full"
            value={cronExpression}
            onChange={(e) => setCronExpression(e.target.value)}
          >
            <option value="*/1 * * * *">Every 1 minute</option>
            <option value="*/5 * * * *">Every 5 minutes</option>
            <option value="*/10 * * * *">Every 10 minutes</option>
            <option value="*/30 * * * *">Every 30 minutes</option>
            <option value="0 * * * *">Every 1 hour</option>
            <option value="0 */6 * * *">Every 6 hours</option>
            <option value="0 */12 * * *">Every 12 hours</option>
            <option value="0 0 * * *">Every 1 day</option>
          </select>
          <Button onClick={handleAddTrigger}>Add Trigger</Button>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="font-semibold mb-2">Active Triggers</h3>
        <div className="border rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-2 text-left">File</th>
                <th className="p-2 text-left">Function</th>
                <th className="p-2 text-left">Schedule</th>
                <th className="p-2 text-left">Status</th>
                <th className="p-2"></th>
              </tr>
            </thead>
            <tbody>
              {triggers.map((trigger) => (
                <tr key={trigger.id} className="border-b">
                  <td className="p-2">{trigger.file.name}</td>
                  <td className="p-2">{trigger.functionName}</td>
                  <td className="p-2">{trigger.cronExpression}</td>
                  <td className="p-2">{trigger.enabled ? "Enabled" : "Disabled"}</td>
                  <td className="p-2 text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteTrigger(trigger.id)}>
                      <Icons.close className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
