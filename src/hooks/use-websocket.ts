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

const connectToWebSocket = (sessionId: string): Promise<WebSocket> => {
  return new Promise((resolve, reject) => {
    // Use wss:// for secure connections (https) or ws:// for non-secure (http)
    const socketHost = import.meta.env.VITE_SOCKET_URL;
    if (!socketHost) {
      console.error('VITE_SOCKET_URL is not set in environment variables');
    }
    
    const host = socketHost || window.location.host;
    // Force wss:// for Railway.app domains
    const protocol = host.includes('railway.app') ? 'wss:' : 
      window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    
    const wsUrl = `${protocol}//${host}/ws/logs/${sessionId}`;
    
    console.log('WebSocket Configuration:');
    console.log('- Protocol:', protocol);
    console.log('- Host:', host);
    console.log('- Full URL:', wsUrl);
    console.log('- Environment VITE_SOCKET_URL:', import.meta.env.VITE_SOCKET_URL);
    
    const socket = new WebSocket(wsUrl);
    
    // Set a timeout for connection
    const timeout = setTimeout(() => {
      if (socket.readyState !== WebSocket.OPEN) {
        socket.close();
        reject(new Error('WebSocket connection timeout'));
      }
    }, 5000); // 5 second timeout
    
    socket.onopen = () => {
      console.log('Connected to WebSocket');
      clearTimeout(timeout);
      resolve(socket);
    };
    
    socket.onerror = (error: Event) => {
      console.error('WebSocket Connection Error:', error);
      console.error('Error details:', {
        type: error.type,
        target: error.target,
      });
      clearTimeout(timeout);
      reject(error);
    };
    
    // Remove the onmessage handler from the initial connection
    // We'll set it up in the useWebSocket hook after the connection is established
  });
};

export function useWebSocket(sessionId: string) {
  const [logs, setLogs] = useState<LogMessage[]>([]);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const MAX_RETRY_ATTEMPTS = 5;
  const RETRY_DELAY = 1000;

  useEffect(() => {
    if (!sessionId) {
      console.warn('No sessionId provided to useWebSocket');
      return;
    }
    
    let reconnectTimeout: NodeJS.Timeout;
    
    const establishConnection = async () => {
      setIsLoading(true);
      try {
        // First establish WebSocket connection
        const newSocket = await connectToWebSocket(sessionId);
        setSocket(newSocket);
        setIsConnected(true);
        setRetryCount(0);

        // Handle incoming log messages
        newSocket.onmessage = (event) => {
          console.log('Raw WebSocket message received:', event.data);
          
          try {
            // Check if the message is a simple string first
            if (typeof event.data === 'string' && event.data.trim() === 'pong') {
              console.log('Received pong response');
              return;
            }

            // Try to clean the message if it's a string
            let messageData = event.data;
            if (typeof messageData === 'string') {
              // Remove any potential BOM or other invisible characters
              messageData = messageData.trim();
              // Remove any potential null bytes
              messageData = messageData.replace(/\0/g, '');
            }
            console.log('Message data:', messageData);
            const data = JSON.parse(messageData);
            console.log('Successfully parsed message:', data);
            
            // Handle connection established message
            if (data.type === 'connection_established') {
              console.log('Connection established message received');
              return;
            }
            
            // Handle ping messages
            if (data.type === 'ping') {
              console.log('Received ping, sending pong');
              newSocket.send('pong');
              return;
            }
            
            // Handle log messages
            if (data.timestamp && data.level && data.message) {
              console.log('Adding log message:', data);
              setLogs(prevLogs => [...prevLogs, data as LogMessage]);
            } else {
              console.warn('Received message with unexpected format:', data);
            }
          } catch (error) {
            console.error('Error parsing message:', error);
            console.error('Raw message type:', typeof event.data);
            console.error('Raw message length:', event.data.length);
            console.error('Raw message content:', event.data);
            
            // Try to find where the JSON parsing fails
            try {
              const firstChar = event.data.charAt(0);
              const secondChar = event.data.charAt(1);
              console.error('First character:', firstChar, 'ASCII:', firstChar.charCodeAt(0));
              console.error('Second character:', secondChar, 'ASCII:', secondChar.charCodeAt(0));
            } catch (e) {
              console.error('Could not analyze message characters:', e);
            }
          }
        };

        newSocket.onerror = (error) => {
          console.error('WebSocket error:', error);
          setIsConnected(false);
        };
        
        newSocket.onclose = () => {
          setIsConnected(false);
          if (retryCount < MAX_RETRY_ATTEMPTS) {
            console.log(`WebSocket closed. Attempting to reconnect (${retryCount + 1}/${MAX_RETRY_ATTEMPTS})...`);
            reconnectTimeout = setTimeout(() => {
              setRetryCount(prevCount => prevCount + 1);
            }, RETRY_DELAY * Math.pow(2, retryCount));
          } else {
            console.error('WebSocket connection failed after maximum retry attempts');
          }
        };

        // Now that WebSocket is connected, fetch products
        const response = await fetch(`/api/v1/products/${sessionId}`);
        const data = await response.json();
        setProducts(data.products);
      } catch (error) {
        console.error('Error establishing connection:', error);
        setIsConnected(false);
      } finally {
        setIsLoading(false);
      }
    };

    establishConnection();

    // Cleanup on unmount
    return () => {
      clearTimeout(reconnectTimeout);
      if (socket?.readyState === WebSocket.OPEN) {
        socket.close();
      }
    };
  }, [sessionId, retryCount]);

  return { logs, socket, isConnected, isLoading, products };
}