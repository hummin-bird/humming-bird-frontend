import React, { useEffect, useRef } from "react";
import { useIsMobile } from "../hooks/use-mobile";
import { Message } from "../types";

interface ConversationDisplayProps {
  messages: Message[];
}

const ConversationDisplay: React.FC<ConversationDisplayProps> = ({
  messages,
}) => {
  const isMobile = useIsMobile();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div
      ref={containerRef}
      className="conversation-container p-3 sm:p-4 w-full max-w-lg max-h-80 sm:max-h-96 overflow-y-auto flex flex-col gap-2"
    >
      {messages.length === 0 ? (
        <div className="text-center text-gray-500 py-6 sm:py-8">
          <p>Your conversation will appear here.</p>
        </div>
      ) : (
        messages.map((message) => (
          <div key={message.id} className={`message ${message.sender}`}>
            <div className="font-medium mb-1 text-sm sm:text-base">
              {message.sender === "ai" ? "Hummingbird:" : "User:"}
            </div>
            <div className="text-sm sm:text-base">{message.text}</div>
          </div>
        ))
      )}
    </div>
  );
};

export default ConversationDisplay;
