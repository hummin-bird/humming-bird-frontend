import React, { createContext, useState, useContext, ReactNode } from "react";
import { Message } from "@/types";

interface GlobalContextProps {
  messages: Message[];
  addMessage: (message: Message) => void;
  conversationId: string;
  setConversationId: (conversationId: string) => void;
}

export const GlobalContext = createContext<GlobalContextProps | undefined>(
  undefined
);
