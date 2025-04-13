
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
    "Scouting the perfect tools for your big idea...",
    "Stocking up your product toolbox...",
    "Gathering clever tools you'll actually love...",
    "Polishing your brilliant concept to a shine...",
    "Turning rough ideas into refined gems...",
    "Sharpening your vision, one insight at a time...",
    "Scanning the market for golden opportunities...",
    "Consulting the wisdom of the digital crowd...",
    "Keeping an eye on what's hot (and what's not)...",
    "Dreaming up bold solutions just for you...",
    "Mixing logic and a touch of magic...",
    "Piecing together fresh, innovative ideas...",
    "Sketching the blueprint of your future product...",
    "Crafting the story behind your product's purpose...",
    "Plotting a path from idea to irresistible offer...",
    "Matching your idea to the perfect market fit...",
    "Checking if this idea's ready for prime time...",
    "Balancing ambition with what's doable...",
    "Putting the finishing touches on your product plan...",
    "Assembling your product's custom playbook...",
    "Rolling out the welcome mat for your big idea..."
  ];

  // Shuffle the messages array
  const shuffledMessages = [...messages].sort(() => Math.random() - 0.5);
  
  let index = 0;
  const sendNextMessage = () => {
    if (index < shuffledMessages.length) {
      const logMessage: LogMessage = {
        timestamp: new Date().toISOString(),
        level: "INFO",
        message: shuffledMessages[index]
      };
      setLogs(prevLogs => [...prevLogs, logMessage]);
      index++;
      
      const nextInterval = Math.floor(Math.random() * 4000) + 2000;
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
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    if (!sessionId) {
      console.warn('No sessionId provided to useWebSocket');
      return;
    }

    const fetchProducts = async () => {
      try {
        const host = import.meta.env.VITE_SOCKET_URL || window.location.host;
        const cleanHost = host.replace(/^https?:\/\//, '');
        const protocol = cleanHost.includes('railway.app') ? 'https:' : 
          window.location.protocol === 'https:' ? 'https:' : 'http:';
        
        const productsUrl = `${protocol}//${cleanHost}/api/v1/products/${sessionId}`;
        console.log('Fetching products from:', productsUrl);

        const response = await fetch(productsUrl);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setProducts(data.products);
      } catch (error) {
        console.error('Error fetching products:', error);
        setProducts([{
          id: "error",
          name: "Error loading products",
          description: "We encountered an error while loading products. Please try again later.",
          website_url: "https://example.com",
          image_url: "https://example.com/image.jpg",
        }]);
      } finally {
        setIsLoading(false);
      }
    };

    // Start fetching products
    fetchProducts();
    
    // Start simulating log messages while waiting for products
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
