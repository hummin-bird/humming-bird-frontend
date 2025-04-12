import { useState } from "react";

import { ReactNode } from "react";
import { GlobalContext } from "../context/globalContext";
import { Message } from "@/types";
export const GlobalProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState<string>("");
  const addMessage = (message: Message) => {
    setMessages((prevMessages) => [...prevMessages, message]);
  };

  return (
    <GlobalContext.Provider
      value={{ messages, addMessage, conversationId, setConversationId }}
    >
      {children}
    </GlobalContext.Provider>
  );
};
