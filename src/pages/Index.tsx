import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import AudioWaveform from "../components/AudioWaveform";
import VoiceRecorder from "../components/VoiceRecorder";
import ConversationDisplay from "../components/ConversationDisplay";
import { useIsMobile } from "../hooks/use-mobile";
import { useGlobalContext } from "../hooks/useGlobalContext";
import { GlobalProvider } from "../components/ui/GlobalContextProvider";
import { Message } from "../types";

const Index = () => {
  const [isRecording, setIsRecording] = useState(false);
  const { messages, addMessage } = useGlobalContext();
  console.log("messages :", messages);

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
