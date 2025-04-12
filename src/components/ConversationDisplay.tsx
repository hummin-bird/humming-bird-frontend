import React, { useEffect, useRef } from "react";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import { useIsMobile } from "../hooks/use-mobile";
import { Message } from "../types";

interface ConversationDisplayProps {
  messages: Message[];
}

const ConversationDisplay: React.FC<ConversationDisplayProps> = ({
  messages,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
    nodeRefs.current = nodeRefs.current.slice(0, messages.length);
  }, [messages]);

  return (
    <div
      ref={containerRef}
      className="conversation-container  rounded-lg p-3 sm:p-4 w-full max-w-lg max-h-80 sm:max-h-96 overflow-y-auto flex flex-col gap-2"
    >
      {messages.length === 0 ? (
        <div className="text-center text-gray-500 py-6 sm:py-8">
          <p>Your conversation will appear here.</p>
        </div>
      ) : (
        <TransitionGroup>
          {messages.map((message, index) => {
            if (!nodeRefs.current[index]) {
              nodeRefs.current[index] = null;
            }
            return (
              <CSSTransition
                key={message.id}
                nodeRef={nodeRefs.current[index]}
                timeout={500}
                classNames="fade"
                in={index === messages.length - 1}
                onEntered={() =>
                  nodeRefs.current[index]?.classList.remove("fade-enter-active")
                }
              >
                <div
                  className={`flex ${
                    message.sender === "ai" ? "justify-start" : "justify-end"
                  }`}
                >
                  <div
                    ref={(el) => (nodeRefs.current[index] = el)}
                    className={`my-3 message ${message.sender}`}
                  >
                    <div className="font-medium mb-1 text-sm sm:text-base">
                      {message.sender === "ai" ? "Hummingbird:" : "User:"}
                    </div>
                    <div className="text-sm sm:text-base">{message.text}</div>
                  </div>
                </div>
              </CSSTransition>
            );
          })}
        </TransitionGroup>
      )}
    </div>
  );
};

export default ConversationDisplay;
