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
    // Remove any protocol prefix from the host
    const cleanHost = host.replace(/^https?:\/\//, '');
    
    // Force wss:// for Railway.app domains
    const protocol = cleanHost.includes('railway.app') ? 'wss:' : 
      window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    
    const wsUrl = `${protocol}//${cleanHost}/ws/logs/${sessionId}`;
    
    console.log('WebSocket Configuration:');
    console.log('- Protocol:', protocol);
    console.log('- Host:', cleanHost);
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
    let simulationCleanup: (() => void) | null = null;
    
    const establishConnection = async () => {
      try {
        // First establish WebSocket connection
        const newSocket = await connectToWebSocket(sessionId);
        
        // Set up message handlers before setting the socket state
        newSocket.onmessage = (event) => {
          console.log('Raw WebSocket message received:', event.data);
          
          try {
            const data = JSON.parse(event.data);
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
            console.error('JSON parsing failed:', error);
            console.error('Error details:', {
              name: error.name,
              message: error.message,
              stack: error.stack
            });
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

        // Now that handlers are set up, update the socket state
        setSocket(newSocket);
        setIsConnected(true);
        setRetryCount(0);

        // Start simulating log messages
        simulationCleanup = simulateLogMessages(setLogs);

        // Make the HTTP request for products
        const host = import.meta.env.VITE_SOCKET_URL || window.location.host;
        // Remove any protocol prefix from the host
        const cleanHost = host.replace(/^https?:\/\//, '');
        
        const protocol = cleanHost.includes('railway.app') ? 'https:' : 
          window.location.protocol === 'https:' ? 'https:' : 'http:';
        
        const productsUrl = `${protocol}//${cleanHost}/api/v1/products/${sessionId}`;
        console.log('Fetching products from:', productsUrl);

        try {
          const response = await fetch(productsUrl);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const text = await response.text();
          console.log('Raw products response:', text);
          
          try {
            const data = JSON.parse(text);
            console.log('Parsed products data:', data);
            setProducts(data.products);
          } catch (error) {
            console.error('Error parsing products JSON:', error);
            console.error('Raw response:', text);
            throw new Error('Invalid JSON response from server');
          }
        } catch (error) {
          console.error('Error fetching products:', error);
          setProducts([{
            id: "error",
            name: "Error loading products",
            description: "We encountered an error while loading products. Please try again later.",
            website_url: "https://example.com",
            image_url: "https://example.com/image.jpg",
          }]);
        }
      } catch (error) {
        console.error('Error establishing WebSocket connection:', error);
        setIsConnected(false);
      } finally {
        // Clean up the simulation when done
        if (simulationCleanup) {
          simulationCleanup();
        }
      }
    };

    establishConnection();

    // Cleanup on unmount
    return () => {
      clearTimeout(reconnectTimeout);
      if (socket?.readyState === WebSocket.OPEN) {
        socket.close();
      }
      if (simulationCleanup) {
        simulationCleanup();
      }
    };
  }, [sessionId, retryCount]);

  return { logs, socket, isConnected, isLoading, products };
}