import React, { useEffect, useRef } from "react";
import { useWebSocket } from "@/hooks/use-websocket";
import AnimationBlob from "./AnimationBlob";
import PremiumListing from "./PremiumListing";

interface WebSocketLogsProps {
  sessionId: string;
  isLoading: boolean;
}

const WebSocketLogs: React.FC<WebSocketLogsProps> = ({
  sessionId,
  isLoading,
}) => {
  const { logs } = useWebSocket(sessionId);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new logs come in
  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]);

  if (!isLoading) {
    return null;
  }

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto p-4">
      <div className="w-full">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-white font-medium">Real-time Logs</h3>
        </div>

        <div className="w-full bg-gray-800 rounded-md p-4 max-h-60 overflow-y-auto mb-4">
          {logs.length === 0 ? (
            <p className="text-gray-400 text-sm italic">Waiting for logs...</p>
          ) : (
            <ul className="space-y-2">
              {logs.map((log, index) => (
                <li
                  key={index}
                  className="text-sm border-l-2 border-blue-400 pl-2"
                >
                  <span className="text-gray-400 text-xs">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                  <span
                    className={`ml-2 ${
                      log.level?.toLowerCase() === "error"
                        ? "text-red-400"
                        : log.level?.toLowerCase() === "warn"
                        ? "text-yellow-400"
                        : "text-green-400"
                    }`}
                  >
                    {log.level || "INFO"}
                  </span>
                  <p className="text-white break-words">{log.message}</p>
                </li>
              ))}
            </ul>
          )}
          <div ref={logsEndRef} />
        </div>
      </div>
      
      {/* Premium Listing */}
      <PremiumListing
        name="Portia AI"
        description="Build multi-agent, stateful, authenticated workflows. Use Portia to guide your LLM's reasoning and deploy agents with managed access permissions."
        logoUrl="/lovable-uploads/c8f1ef40-75ba-4e89-b53a-b4822e8e0b7d.png"
      />
    </div>
  );
};

export default WebSocketLogs;
