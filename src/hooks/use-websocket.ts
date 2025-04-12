import { useEffect, useState } from 'react';

interface LogMessage {
  timestamp: string;
  level: string;
  message: string;
}

const connectToWebSocket = (sessionId: string): WebSocket => {
  // Use secure WebSocket protocol
  const socket = new WebSocket(`wss://humming-bird-backend-production.up.railway.app/ws/logs/${sessionId}`);
  
  socket.onopen = () => {
    console.log('Connected to WebSocket');
  };
  
  socket.onerror = (error) => {
    console.error('Connection error:', error);
  };
  
  socket.onmessage = (event) => {
    console.log('Received message:', event.data);
  };
  
  return socket;
};

export function useWebSocket(sessionId: string) {
  const [logs, setLogs] = useState<LogMessage[]>([]);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRY_ATTEMPTS = 5;
  const RETRY_DELAY = 1000;

  useEffect(() => {
    if (!sessionId) {
      console.warn('No sessionId provided to useWebSocket');
      return;
    }
    
    let reconnectTimeout: NodeJS.Timeout;
    
    // Connect to the WebSocket server
    const newSocket = connectToWebSocket(sessionId);
    setSocket(newSocket);

    // Handle incoming log messages
    newSocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as LogMessage;
        console.log('Adding log message:', data);
        setLogs(prevLogs => [...prevLogs, data]);
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    };
    
    // Handle reconnection
    newSocket.onclose = () => {
      if (retryCount < MAX_RETRY_ATTEMPTS) {
        console.log(`WebSocket closed. Attempting to reconnect (${retryCount + 1}/${MAX_RETRY_ATTEMPTS})...`);
        reconnectTimeout = setTimeout(() => {
          setRetryCount(retryCount + 1);
        }, RETRY_DELAY);
      } else {
        console.error('WebSocket connection failed after maximum retry attempts');
      }
    };

    // Cleanup on unmount
    return () => {
      clearTimeout(reconnectTimeout);
      newSocket.close();
    };
  }, [sessionId, retryCount]);

  return { logs, socket };
}

