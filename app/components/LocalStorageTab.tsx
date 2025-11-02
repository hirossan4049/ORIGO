'use client'

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Icons } from "@/app/components/ui/icons";

interface LocalStorageItem {
  key: string;
  value: string;
}

interface LocalStorageTabProps {
  projectId?: string;
}

export function LocalStorageTab({ projectId }: LocalStorageTabProps) {
  const [items, setItems] = useState<LocalStorageItem[]>([]);
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchLocalStorageItems = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    // Simulate API call to fetch local storage items
    const simulatedItems: LocalStorageItem[] = [
      { key: "USER_PREF", value: "dark_mode" },
      { key: "LAST_SESSION", value: "2024-01-01" },
    ];
    setItems(simulatedItems);
    setLoading(false);
  }, [projectId]);

  useEffect(() => {
    fetchLocalStorageItems();
  }, [fetchLocalStorageItems]);

  const handleAddItem = () => {
    if (newKey && newValue) {
      setItems([...items, { key: newKey, value: newValue }]);
      setNewKey("");
      setNewValue("");
    }
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleUpdateItem = (index: number, field: "key" | "value", value: string) => {
    const updatedItems = [...items];
    updatedItems[index][field] = value;
    setItems(updatedItems);
  };

  const handleSaveItems = async () => {
    setSaving(true);
    // Simulate API call to save local storage items
    console.log("Saving local storage items:", items);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
    setSaving(false);
    alert("Local storage items saved!");
  };

  if (!projectId) {
    return <div className="text-gray-600">Select a project to manage local storage.</div>;
  }

  if (loading) {
    return <div>Loading local storage items...</div>;
  }

  return (
    <div>
      <div className="border rounded-lg p-4">
        <h3 className="font-semibold mb-2">Add New Local Storage Item</h3>
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
          <Button onClick={handleAddItem} variant="outline" size="sm">
            <Icons.add className="w-4 h-4 mr-2" />
            Add
          </Button>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="font-semibold mb-2">Current Local Storage Items</h3>
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
              {items.map((item, index) => (
                <tr key={index} className="border-b">
                  <td className="p-2 font-mono">{item.key}</td>
                  <td className="p-2 font-mono">{item.value}</td>
                  <td className="p-2 text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(index)}>
                      <Icons.close className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Button onClick={handleSaveItems} disabled={saving} className="mt-4">
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
