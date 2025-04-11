
import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Mic, MicOff } from "lucide-react";
import { useIsMobile } from "../hooks/use-mobile";

interface VoiceRecorderProps {
  onTranscriptionUpdate: (text: string) => void;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onTranscriptionUpdate }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState('');
  const isMobile = useIsMobile();
  
  // References for speech recognition
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  
  // Initialize speech recognition on component mount
  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      if (recognitionRef.current) {
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        
        recognitionRef.current.onresult = (event) => {
          const transcript = Array.from(event.results)
            .map(result => result[0].transcript)
            .join('');
          
          setTranscription(transcript);
          onTranscriptionUpdate(transcript);
        };
        
        recognitionRef.current.onerror = (event) => {
          console.error('Speech recognition error', event.error);
          setIsRecording(false);
        };
        
        recognitionRef.current.onend = () => {
          if (isRecording) {
            recognitionRef.current?.start();
          }
        };
      }
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [onTranscriptionUpdate]);
  
  // Handle recording toggle
  const toggleRecording = () => {
    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
    } else {
      if (recognitionRef.current) {
        setTranscription('');
        onTranscriptionUpdate('');
        recognitionRef.current.start();
      }
      setIsRecording(true);
    }
  };
  
  return (
    <div className="flex flex-col items-center gap-4 w-full px-4">
      {/* Record Button */}
      <div className="relative">
        {isRecording && (
          <div className="absolute inset-0 rounded-full border-2 border-hummingbird-primary animate-pulse-ring" />
        )}
        <Button
          onClick={toggleRecording}
          className={`h-14 w-14 sm:h-16 sm:w-16 rounded-full ${
            isRecording 
              ? 'bg-hummingbird-primary hover:bg-hummingbird-secondary shadow-lg shadow-blue-500/30' 
              : 'bg-gray-700 hover:bg-gray-600 shadow-lg shadow-gray-900/20'
          }`}
          aria-label={isRecording ? 'Stop recording' : 'Start recording'}
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
        {transcription && (
          <p className="text-gray-300 text-sm sm:text-base">{transcription}</p>
        )}
        {!transcription && !isRecording && (
          <p className="text-gray-500 italic text-sm sm:text-base">Press the button to start speaking...</p>
        )}
        {!transcription && isRecording && (
          <p className="text-gray-400 text-sm sm:text-base">Listening...</p>
        )}
      </div>
    </div>
  );
};

export default VoiceRecorder;
