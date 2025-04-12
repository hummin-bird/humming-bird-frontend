import React, { createContext, useState, useContext, ReactNode } from "react";
import { Message } from "@/types";

interface GlobalContextProps {
  messages: Message[];
  addMessage: (message: Message) => void;
}

export const GlobalContext = createContext<GlobalContextProps | undefined>(
  undefined
);

export const GlobalProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);

  const addMessage = (message: Message) => {
    setMessages((prevMessages) => [...prevMessages, message]);
  };

  return (
    <GlobalContext.Provider value={{ messages, addMessage }}>
      {children}
    </GlobalContext.Provider>
  );
};
