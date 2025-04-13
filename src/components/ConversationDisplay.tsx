import React, { useEffect, useRef, useState } from "react";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import { useIsMobile } from "../hooks/use-mobile";
import { Message } from "../types";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";
import { ChevronDown, ChevronUp } from "lucide-react";

interface ConversationDisplayProps {
  messages: Message[];
}

const ConversationDisplay: React.FC<ConversationDisplayProps> = ({
  messages,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [isOpen, setIsOpen] = useState(true);

  const hasMessages = messages.length > 0;

  useEffect(() => {
    if (containerRef.current && isOpen) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
    nodeRefs.current = nodeRefs.current.slice(0, messages.length);
  }, [messages, isOpen]);

  return (
    <div className="w-full max-w-2xl mx-auto">
      {hasMessages ? (
        <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
          <div className="flex items-center justify-end mb-2">
            <CollapsibleTrigger className="p-1 rounded-md hover:bg-hummingbird-dark/50 transition-colors">
              {isOpen ? (
                <ChevronUp className="h-4 w-4 text-hummingbird-primary" />
              ) : (
                <ChevronDown className="h-4 w-4 text-hummingbird-primary" />
              )}
            </CollapsibleTrigger>
          </div>

          <div className="relative">
            <CollapsibleContent className="transition-all duration-500 ease-in-out data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
              <div
                ref={containerRef}
                className="conversation-container rounded-lg p-3 sm:p-4 w-full max-h-80 sm:max-h-96 overflow-y-auto flex flex-col gap-2"
              >
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
                          nodeRefs.current[index]?.classList.remove(
                            "fade-enter-active"
                          )
                        }
                      >
                        <div
                          className={`flex ${
                            message.sender === "ai"
                              ? "justify-start"
                              : "justify-end"
                          }`}
                        >
                          <div
                            ref={(el) => (nodeRefs.current[index] = el)}
                            className={`my-3 message ${message.sender}`}
                          >
                            <div className="font-medium mb-1 text-sm sm:text-base">
                              {message.sender === "ai"
                                ? "Hummingbird:"
                                : "User:"}
                            </div>
                            <div className="text-sm sm:text-base">
                              {message.text}
                            </div>
                          </div>
                        </div>
                      </CSSTransition>
                    );
                  })}
                </TransitionGroup>
              </div>
            </CollapsibleContent>

            {/* Collapsed state */}
            <div
              className="collapsed-state"
              data-state={isOpen ? "open" : "closed"}
              onClick={() => !isOpen && setIsOpen(true)}
            >
              <div className="conversation-container rounded-lg p-3 sm:p-4 w-full h-full flex items-center justify-center">
                <div className="text-center text-gray-500"></div>
              </div>
            </div>
            <div className="conversation-fade-edge"></div>
          </div>
        </Collapsible>
      ) : (
        <div className="relative">
          <div className="conversation-container rounded-lg p-3 sm:p-4 w-full max-h-80 sm:max-h-96 overflow-y-auto flex flex-col gap-2">
            <div className="text-center text-gray-500 py-6 sm:py-8">
              <p>I'll jot down everything we chat about, right here.</p>
            </div>
          </div>
          {/* <div className="conversation-fade-edge"></div> */}
        </div>
      )}
    </div>
  );
};

export default ConversationDisplay;
