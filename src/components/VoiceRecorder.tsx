
import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Mic, MicOff } from "lucide-react";

interface VoiceRecorderProps {
  onTranscriptionUpdate: (text: string) => void;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onTranscriptionUpdate }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState('');
  
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
    <div className="flex flex-col items-center gap-6 w-full">
      {/* Record Button */}
      <div className="relative">
        {isRecording && (
          <div className="absolute inset-0 rounded-full border-2 border-hummingbird-primary animate-pulse-ring" />
        )}
        <Button
          onClick={toggleRecording}
          className={`h-16 w-16 rounded-full ${
            isRecording 
              ? 'bg-hummingbird-primary hover:bg-hummingbird-secondary' 
              : 'bg-gray-200 hover:bg-gray-300'
          }`}
          aria-label={isRecording ? 'Stop recording' : 'Start recording'}
        >
          {isRecording ? (
            <MicOff className="h-8 w-8 text-white" />
          ) : (
            <Mic className="h-8 w-8 text-gray-600" />
          )}
        </Button>
      </div>
      
      {/* Current Transcription */}
      <div className="w-full max-w-lg text-center min-h-20">
        {transcription && (
          <p className="text-gray-700">{transcription}</p>
        )}
        {!transcription && !isRecording && (
          <p className="text-gray-500 italic">Press the button to start speaking...</p>
        )}
        {!transcription && isRecording && (
          <p className="text-gray-500">Listening...</p>
        )}
      </div>
    </div>
  );
};

export default VoiceRecorder;
