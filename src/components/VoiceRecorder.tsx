import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff } from "lucide-react";
import { useGlobalContext } from "@/hooks/useGlobalContext";
import { useWelcomeMessage } from "@/hooks/useWelcomeMessage";

interface VoiceRecorderProps {
  isRecording: boolean;
  setIsRecording: (isRecording: boolean) => void;
  onConversationEnd: () => void;
  onConversationStart: () => void;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  isRecording,
  setIsRecording,
  onConversationEnd,
  onConversationStart,
}) => {
  const { addMessage } = useGlobalContext();
  const welcomeMessage = useWelcomeMessage();

  const toggleConversation = () => {
    if (isRecording) {
      // Stop recording
      setIsRecording(false);
      onConversationEnd();
    } else {
      // Start recording
      setIsRecording(true);
      onConversationStart();
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full px-4">
      {/* Record Button */}
      <div className="relative cursor-pointer" onClick={toggleConversation}>
        {isRecording && (
          <div className="absolute inset-0 border-white rounded-full border-2 animate-pulse-ring" />
        )}
        <Button
          className={`h-14 w-14 sm:h-16 sm:w-16 rounded-full ${
            isRecording
              ? "bg-white/90 bg-[radial-gradient(circle_at_center,_rgba(66,153,225,0.2)_0%,_rgba(66,153,225,0.3)_100%)] text-blue-500"
              : "bg-gray-700 hover:bg-gray-600 shadow-lg shadow-gray-900/20"
          }`}
          aria-label={isRecording ? "Stop conversation" : "Start conversation"}
        >
          {isRecording ? (
            <MicOff className="h-6 w-6 sm:h-8 sm:w-8 text-[#4299E1]" />
          ) : (
            <Mic className="h-6 w-6 sm:h-8 sm:w-8 text-gray-300" />
          )}
        </Button>
      </div>

      {/* Current Transcription */}
      <div className="w-full max-w-lg text-center min-h-16 px-2">
        {!isRecording && (
          <p className="text-gray-500 italic text-sm sm:text-base">
            {welcomeMessage}
          </p>
        )}
        {isRecording && (
          <p className="text-gray-400 text-sm sm:text-base">Hearing you loud and clear!</p>
        )}
      </div>
    </div>
  );
};

export default VoiceRecorder;
