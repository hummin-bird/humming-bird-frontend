import React, { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff } from "lucide-react";
import { useConversation } from "@11labs/react";
import { useGlobalContext } from "@/hooks/useGlobalContext";
import { v4 as uuidv4 } from "uuid";

interface VoiceRecorderProps {
  isRecording: boolean;
  setIsRecording: (isRecording: boolean) => void;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  isRecording,
  setIsRecording,
}) => {
  const { addMessage } = useGlobalContext();

  const onMessage = (event) => {
    console.log("event :", event);
    addMessage({
      id: uuidv4(),
      text: event.message,
      sender: event.source,
    });
  };

  // ElevenLabs conversation setup
  const conversation = useConversation({
    onConnect: (event) => console.log("Connected to ElevenLabs", event),
    onDisconnect: (event) => console.log("Disconnected from ElevenLabs", event),
    onMessage,
    onError: (error) => console.error("Error with ElevenLabs:", error),
  });

  const toggleConversation = useCallback(async () => {
    if (conversation.status === "connected" || isRecording) {
      await conversation.endSession();
      setIsRecording(false);
    } else {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        await conversation.startSession({
          agentId: import.meta.env.VITE_AGENT_ID,
        });
        setIsRecording(true);
      } catch (error) {
        console.error("Failed to start conversation:", error);
      }
    }
  }, [conversation, isRecording, setIsRecording]);

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
              ? "bg-hummingbird-primary hover:bg-hummingbird-secondary shadow-lg shadow-blue-500/30"
              : "bg-gray-700 hover:bg-gray-600 shadow-lg shadow-gray-900/20"
          }`}
          aria-label={isRecording ? "Stop conversation" : "Start conversation"}
        >
          {isRecording ? (
            <MicOff className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
          ) : (
            <Mic className="h-6 w-6 sm:h-8 sm:w-8 text-gray-300" />
          )}
        </Button>
      </div>

      {/* Current Transcription */}
      <div className="w-full max-w-lg text-center min-h-16 px-2">
        {!isRecording && (
          <p className="text-gray-500 italic text-sm sm:text-base">
            Press the button to start conversation...
          </p>
        )}
        {isRecording && (
          <p className="text-gray-400 text-sm sm:text-base">Connected...</p>
        )}
      </div>
    </div>
  );
};

export default VoiceRecorder;
