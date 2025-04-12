import { useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';

interface LogMessage {
  timestamp: string;
  level: string;
  message: string;
}

const connectToWebSocket = (sessionId: string) => {
  // Try using secure protocol
  const socket = io('wss://humming-bird-backend-production.up.railway.app/ws/logs/' + sessionId, {
    transports: ['websocket'],
    forceNew: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000
  });
  
  socket.on('connect', () => {
    console.log('Connected to WebSocket');
  });
  
  socket.on('connect_error', (error) => {
    console.error('Connection error:', error);
  });
  
  socket.on('message', (data) => {
    console.log('Received message:', data);
  });
  
  return socket;
};

export function useWebSocket(sessionId: string) {
  const [logs, setLogs] = useState<LogMessage[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!sessionId) {
      console.warn('No sessionId provided to useWebSocket');
      return;
    }
    
    // Connect to the WebSocket server
    const newSocket = connectToWebSocket(sessionId);
    setSocket(newSocket);

    // Handle incoming log messages
    newSocket.on('message', (data: LogMessage) => {
      console.log('Adding log message:', data);
      setLogs(prevLogs => [...prevLogs, data]);
    });

    // Cleanup on unmount
    return () => {
      newSocket.disconnect();
    };
  }, [sessionId]);

  return { logs, socket };
}

