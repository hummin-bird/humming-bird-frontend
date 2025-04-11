
import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import AudioWaveform from "../components/AudioWaveform";
import VoiceRecorder from "../components/VoiceRecorder";
import ConversationDisplay from "../components/ConversationDisplay";

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
}

const Index = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [currentTranscription, setCurrentTranscription] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: uuidv4(),
      text: "Hey, tell me about your product!",
      sender: 'bot'
    }
  ]);

  const handleTranscriptionUpdate = (text: string) => {
    setCurrentTranscription(text);
  };

  // Monitor recording state from the child component
  const handleRecordingStateChange = (recording: boolean) => {
    setIsRecording(recording);
  };

  // Mock response generation when user stops speaking
  useEffect(() => {
    if (currentTranscription && !isRecording) {
      // Add user message to conversation
      const userMessage: Message = {
        id: uuidv4(),
        text: currentTranscription,
        sender: 'user'
      };
      setMessages(prev => [...prev, userMessage]);
      
      // Simulate bot thinking and response
      setTimeout(() => {
        let botResponse = "";
        
        if (currentTranscription.toLowerCase().includes("website")) {
          botResponse = "I'd be happy to help you build a website! What kind of features would you need?";
        } else if (currentTranscription.toLowerCase().includes("product")) {
          botResponse = "I'm Hummingbird, a voice-based AI assistant that can help you with various tasks. What would you like to know more about?";
        } else {
          botResponse = "That's interesting! Can you tell me more about what you're looking to achieve?";
        }
        
        const botMessage: Message = {
          id: uuidv4(),
          text: botResponse,
          sender: 'bot'
        };
        
        setMessages(prev => [...prev, botMessage]);
      }, 1000);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRecording]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-between p-4 sm:p-8 bg-gradient-to-b from-hummingbird-light to-white">
      <div className="w-full max-w-4xl flex flex-col items-center gap-8 py-8">
        {/* Header */}
        <h1 className="humming-title text-4xl sm:text-5xl font-bold text-hummingbird-accent">
          HUMMINGBIRD
        </h1>
        
        {/* Audio Visualization */}
        <div className="w-full max-w-md aspect-square flex items-center justify-center">
          <div className="relative w-64 h-64 sm:w-80 sm:h-80 rounded-full bg-white shadow-lg flex items-center justify-center">
            <AudioWaveform isRecording={isRecording} />
          </div>
        </div>
        
        {/* Voice Recorder Component */}
        <VoiceRecorder 
          onTranscriptionUpdate={handleTranscriptionUpdate} 
        />
        
        {/* Conversation Display */}
        <ConversationDisplay messages={messages} />
      </div>
    </div>
  );
};

export default Index;
