import { useState, useEffect } from 'react';

const welcomeMessages = [
  "Tell me what you're building — I'll fetch the perfect tools.",
  "Share your idea — I'll find the tools to make it real.",
  "Speak your vision — I'll gather everything you need.",
  "Pitch me your product — I'll track down the perfect toolkit.",
  "Describe your dream — I'll source the tools to build it.",
  "Let's shape your idea — I'll fetch the tools for the job.",
  "Say what you're creating — I'll handle the tool hunt.",
  "Unpack your product idea — I'll build your toolset.",
  "Tell me what you need — I'll assemble your toolkit.",
  "Voice your concept — I'll scout the tools to make it happen."
];

export function useWelcomeMessage() {
  const [message, setMessage] = useState(welcomeMessages[0]);

  useEffect(() => {
    // Get a random message from the list
    const randomIndex = Math.floor(Math.random() * welcomeMessages.length);
    setMessage(welcomeMessages[randomIndex]);
  }, []);

  return message;
} 