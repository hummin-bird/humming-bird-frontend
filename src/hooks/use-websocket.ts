
import { useEffect, useState } from 'react';

interface LogMessage {
  timestamp: string;
  level: string;
  message: string;
  type?: string;  // Optional type field for ping/pong messages
}

interface ConnectionMessage {
  type: string;
  message: string;
}

const simulateLogMessages = (setLogs: React.Dispatch<React.SetStateAction<LogMessage[]>>) => {
  const messages = [
    "Getting the best tools for the job...",
    "Refining your fine idea...",
    "Analyzing market trends...",
    "Generating innovative solutions...",
    "Crafting unique value propositions...",
    "Designing user-friendly interfaces...",
    "Optimizing for market fit...",
    "Finalizing product details..."
  ];

  let index = 0;
  const sendNextMessage = () => {
    if (index < messages.length) {
      const logMessage: LogMessage = {
        timestamp: new Date().toISOString(),
        level: "INFO",
        message: messages[index]
      };
      setLogs(prevLogs => [...prevLogs, logMessage]);
      index++;
      
      const nextInterval = Math.floor(Math.random() * 8000) + 2000;
      setTimeout(sendNextMessage, nextInterval);
    }
  };

  // Start the sequence
  sendNextMessage();

  return () => {
    // Cleanup function
  };
};

export function useWebSocket(sessionId: string) {
  const [logs, setLogs] = useState<LogMessage[]>([]);
  const [isConnected] = useState(true);
  const [isLoading] = useState(true);
  const [products] = useState<any[]>([]);

  useEffect(() => {
    if (!sessionId) {
      console.warn('No sessionId provided to useWebSocket');
      return;
    }
    
    // Start simulating log messages
    const simulationCleanup = simulateLogMessages(setLogs);

    // Cleanup on unmount
    return () => {
      if (simulationCleanup) {
        simulationCleanup();
      }
    };
  }, [sessionId]);

  return { logs, isConnected, isLoading, products };
}
