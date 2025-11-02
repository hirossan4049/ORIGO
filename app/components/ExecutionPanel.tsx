'use client'

import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { Button } from "@/app/components/ui/button";
import { Icons } from "@/app/components/ui/icons";

interface ExecutionPanelProps {
  fileId: string;
  functionNames: string[];
}

interface ExecutionLog {
  functionName: string;
  timestamp: string;
  success: boolean;
  result?: any;
  error?: any;
  consoleLogs?: string[];
}

export const ExecutionPanel = forwardRef(({ fileId, functionNames }: ExecutionPanelProps, ref) => {
  const [selectedFunction, setSelectedFunction] = useState("main");
  const [logs, setLogs] = useState<ExecutionLog[]>([]);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (functionNames.length > 0 && !functionNames.includes(selectedFunction)) {
      setSelectedFunction(functionNames[0]);
    }
  }, [functionNames, selectedFunction]);

  const handleRun = async (funcName: string = selectedFunction) => {
    setRunning(true);
    const startTime = new Date();
    try {
      const response = await fetch(`/api/files/${fileId}/execute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ functionName: funcName }),
      });
      const result = await response.json();
      setLogs(prevLogs => [
        {
          functionName: funcName,
          timestamp: startTime.toLocaleString(),
          success: result.success,
          result: result.result,
          error: result.error,
          consoleLogs: result.logs,
        },
        ...prevLogs,
      ]);
    } catch (error) {
      console.error("Error executing function:", error);
      setLogs(prevLogs => [
        {
          functionName: funcName,
          timestamp: startTime.toLocaleString(),
          success: false,
          error: "An unexpected error occurred.",
          consoleLogs: [],
        },
        ...prevLogs,
      ]);
    } finally {
      setRunning(false);
    }
  };

  useImperativeHandle(ref, () => ({
    runMainFunction() {
      handleRun("main");
    },
  }));

  return (
    <div className="flex flex-col h-full bg-white border-t border-gray-200">
      <div className="flex items-center justify-between p-2 bg-gray-100 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <select
            value={selectedFunction}
            onChange={(e) => setSelectedFunction(e.target.value)}
            className="text-sm p-1 border border-gray-300 rounded-md"
          >
            {functionNames.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
          <Button onClick={() => handleRun()} size="sm" disabled={running}>
            <Icons.play className="w-4 h-4 mr-2" />
            {running ? "Running..." : "Run"}
          </Button>
        </div>
      </div>
      <div className="flex-1 p-4 overflow-y-auto space-y-2">
        {logs.map((log, index) => (
          <div key={index} className={`p-2 rounded-md text-sm ${log.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
            <div className="flex items-center gap-2">
              {log.success ? (
                <Icons.success className="w-4 h-4 text-green-600" />
              ) : (
                <Icons.error className="w-4 h-4 text-red-600" />
              )}
              <span className="font-semibold">{log.functionName}</span>
              <span className="text-gray-500 text-xs">{log.timestamp}</span>
            </div>
            {typeof log.result !== "undefined" && (
              <div className="mt-2">
                <span className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">Result</span>
                <pre className="mt-1 rounded bg-white/60 p-2 whitespace-pre-wrap text-gray-800">
                  {JSON.stringify(log.result, null, 2)}
                </pre>
              </div>
            )}
            {log.error && (
              <div className="mt-2">
                <span className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">Error</span>
                <pre className="mt-1 rounded bg-white/60 p-2 whitespace-pre-wrap text-gray-800">
                  {typeof log.error === "string" ? log.error : JSON.stringify(log.error, null, 2)}
                </pre>
              </div>
            )}
            {log.consoleLogs && log.consoleLogs.length > 0 && (
              <div className="mt-2">
                <span className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">Console</span>
                <div className="mt-1 space-y-1">
                  {log.consoleLogs.map((entry, logIndex) => (
                    <pre key={logIndex} className="rounded bg-black/80 p-2 text-xs text-green-200 whitespace-pre-wrap">
                      {entry}
                    </pre>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
});

ExecutionPanel.displayName = 'ExecutionPanel';
