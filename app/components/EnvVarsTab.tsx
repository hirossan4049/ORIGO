'use client'

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Icons } from "@/app/components/ui/icons";

interface EnvVar {
  key: string;
  value: string;
}

interface EnvVarsTabProps {
  projectId?: string;
}

export function EnvVarsTab({ projectId }: EnvVarsTabProps) {
  const [envVars, setEnvVars] = useState<EnvVar[]>([]);
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchEnvVars = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    // Simulate API call to fetch env vars
    // In a real app, this would be an API call like /api/projects/${projectId}/env-vars
    const simulatedEnvVars: EnvVar[] = [
      { key: "API_KEY", value: "your_api_key" },
      { key: "DB_HOST", value: "localhost" },
    ];
    setEnvVars(simulatedEnvVars);
    setLoading(false);
  }, [projectId]);

  useEffect(() => {
    fetchEnvVars();
  }, [fetchEnvVars]);

  const handleAddEnvVar = () => {
    if (newKey && newValue) {
      setEnvVars([...envVars, { key: newKey, value: newValue }]);
      setNewKey("");
      setNewValue("");
    }
  };

  const handleRemoveEnvVar = (index: number) => {
    setEnvVars(envVars.filter((_, i) => i !== index));
  };

  const handleUpdateEnvVar = (index: number, field: "key" | "value", value: string) => {
    const updatedEnvVars = [...envVars];
    updatedEnvVars[index][field] = value;
    setEnvVars(updatedEnvVars);
  };

  const handleSaveEnvVars = async () => {
    setSaving(true);
    // Simulate API call to save env vars
    // In a real app, this would be an API call to update env vars for the project
    console.log("Saving environment variables:", envVars);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
    setSaving(false);
    alert("Environment variables saved!");
  };

  if (!projectId) {
    return <div className="text-gray-600">Select a project to manage environment variables.</div>;
  }

  if (loading) {
    return <div>Loading environment variables...</div>;
  }

  return (
    <div>
      <div className="border rounded-lg p-4">
        <h3 className="font-semibold mb-2">Add New Environment Variable</h3>
        <div className="flex gap-4 mb-2">
          <Input
            placeholder="Key"
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
            className="font-mono"
          />
          <Input
            placeholder="Value"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            className="font-mono"
          />
          <Button onClick={handleAddEnvVar} variant="outline" size="sm">
            <Icons.add className="w-4 h-4 mr-2" />
            Add
          </Button>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="font-semibold mb-2">Current Environment Variables</h3>
        <div className="border rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-2 text-left">Key</th>
                <th className="p-2 text-left">Value</th>
                <th className="p-2"></th>
              </tr>
            </thead>
            <tbody>
              {envVars.map((item, index) => (
                <tr key={index} className="border-b">
                  <td className="p-2 font-mono">{item.key}</td>
                  <td className="p-2 font-mono">{item.value}</td>
                  <td className="p-2 text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleRemoveEnvVar(index)}>
                      <Icons.close className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Button onClick={handleSaveEnvVars} disabled={saving} className="mt-4">
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
