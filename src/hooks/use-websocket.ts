import { useEffect, useState } from 'react';

interface LogMessage {
  timestamp: string;
  level: string;
  message: string;
}

const connectToWebSocket = (sessionId: string): WebSocket => {
  // Use wss:// for secure connections (https) or ws:// for non-secure (http)
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = process.env.NEXT_PUBLIC_API_URL || window.location.host;
  const socket = new WebSocket(`${protocol}//${host}/ws/logs/${sessionId}`);
  
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
  const [isConnected, setIsConnected] = useState(false);
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

    newSocket.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      setRetryCount(0); // Reset retry count on successful connection
    };

    newSocket.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
    };
    
    // Handle reconnection
    newSocket.onclose = () => {
      setIsConnected(false);
      if (retryCount < MAX_RETRY_ATTEMPTS) {
        console.log(`WebSocket closed. Attempting to reconnect (${retryCount + 1}/${MAX_RETRY_ATTEMPTS})...`);
        reconnectTimeout = setTimeout(() => {
          setRetryCount(prevCount => prevCount + 1);
        }, RETRY_DELAY * Math.pow(2, retryCount)); // Exponential backoff
      } else {
        console.error('WebSocket connection failed after maximum retry attempts');
      }
    };

    // Cleanup on unmount
    return () => {
      clearTimeout(reconnectTimeout);
      if (newSocket.readyState === WebSocket.OPEN) {
        newSocket.close();
      }
    };
  }, [sessionId, retryCount]);

  return { logs, socket, isConnected };
}