import React, { useEffect, useRef } from "react";
import { useWebSocket } from "@/hooks/use-websocket";
import AnimationBlob from "./AnimationBlob";

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
      <div className="relative w-full flex justify-center mb-4">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
          <p className="text-white font-medium">Processing your request...</p>
        </div>
      </div>

      <div className="w-full bg-gray-800 rounded-md p-4 max-h-60 overflow-y-auto">
        <h3 className="text-white font-medium mb-2">Real-time Logs</h3>
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
                    log.level.toLowerCase() === "error"
                      ? "text-red-400"
                      : log.level.toLowerCase() === "warn"
                      ? "text-yellow-400"
                      : "text-green-400"
                  }`}
                >
                  {log.level}
                </span>
                <p className="text-white break-words">{log.message}</p>
              </li>
            ))}
          </ul>
        )}
        <div ref={logsEndRef} />
      </div>
    </div>
  );
};

export default WebSocketLogs;
