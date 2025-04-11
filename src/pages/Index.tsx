import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import AudioWaveform from "../components/AudioWaveform";
import VoiceRecorder from "../components/VoiceRecorder";
import ConversationDisplay from "../components/ConversationDisplay";
import { useIsMobile } from "../hooks/use-mobile";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
}

const Index = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [currentTranscription, setCurrentTranscription] = useState("");
  const isMobile = useIsMobile();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: uuidv4(),
      text: "Hey, tell me about your product!",
      sender: "bot",
    },
  ]);

  // Mock response generation when user stops speaking
  useEffect(() => {
    if (currentTranscription && !isRecording) {
      // Add user message to conversation
      const userMessage: Message = {
        id: uuidv4(),
        text: currentTranscription,
        sender: "user",
      };
      setMessages((prev) => [...prev, userMessage]);

      // Simulate bot thinking and response
      setTimeout(() => {
        let botResponse = "";

        if (currentTranscription.toLowerCase().includes("website")) {
          botResponse =
            "I'd be happy to help you build a website! What kind of features would you need?";
        } else if (currentTranscription.toLowerCase().includes("product")) {
          botResponse =
            "I'm Hummingbird, a voice-based AI assistant that can help you with various tasks. What would you like to know more about?";
        } else {
          botResponse =
            "That's interesting! Can you tell me more about what you're looking to achieve?";
        }

        const botMessage: Message = {
          id: uuidv4(),
          text: botResponse,
          sender: "bot",
        };

        setMessages((prev) => [...prev, botMessage]);
      }, 1000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRecording]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-between p-3 sm:p-6 bg-gradient-to-b from-hummingbird-light to-hummingbird-background">
      <div className="w-full max-w-4xl flex flex-col items-center gap-6 sm:gap-8 py-6">
        {/* Header */}
        <h1 className="humming-title text-3xl sm:text-4xl md:text-5xl font-bold text-hummingbird-primary">
          HUMMINGBIRD
        </h1>

        {/* Audio Visualization */}
        <div className="flex items-center justify-center w-full">
          <div className="relative w-64 h-64">
            <AudioWaveform isRecording={isRecording} />
          </div>
        </div>

        {/* Voice Recorder Component */}
        <VoiceRecorder
          isRecording={isRecording}
          setIsRecording={setIsRecording}
        />

        {/* Conversation Display */}
        <div className="w-full px-3 sm:px-0">
          <ConversationDisplay messages={messages} />
        </div>
      </div>
    </div>
  );
};

export default Index;
