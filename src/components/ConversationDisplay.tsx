
import React from 'react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
}

interface ConversationDisplayProps {
  messages: Message[];
}

const ConversationDisplay: React.FC<ConversationDisplayProps> = ({ messages }) => {
  return (
    <div className="conversation-container bg-white shadow-lg p-4 w-full max-w-lg max-h-96 overflow-y-auto flex flex-col gap-2">
      {messages.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          <p>Your conversation will appear here.</p>
        </div>
      ) : (
        messages.map((message) => (
          <div
            key={message.id}
            className={`message ${message.sender}`}
          >
            <div className="font-medium mb-1">
              {message.sender === 'bot' ? 'Bird:' : 'User:'}
            </div>
            <div>{message.text}</div>
          </div>
        ))
      )}
    </div>
  );
};

export default ConversationDisplay;
