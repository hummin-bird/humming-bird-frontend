# Project Architecture Overview

This project is a web application built with React and TypeScript that enables voice-based conversations and displays product recommendations.

## Code Organization

- The codebase is organized into several main directories:
  - `src/components`: Contains main UI elements and their logic
  - `src/pages`: Contains page-level components
  - `src/hooks`: Contains custom React hooks like 
  - `src/types`: Contains TypeScript type definitions
  - `src/lib`: Contains utility functions

- The application uses React for the user interface
- Page navigation is managed through React Router
- Data fetching and caching is handled with React Query
- Application state is managed through React Context

## Interface Structure

### Main Components

- `VoiceRecorder`: Controls the voice input functionality
- `AudioWaveform`: Visualizes audio input
- `ConversationDisplay`: Shows the conversation history
- `ProductList`: Displays product recommendations
- `AnimationBlob`: Provides visual feedback

### UI Components

- Basic interface elements are stored in `src/components/ui`
- These include buttons, inputs, dialogs, and other common UI elements

### Pages

- Main page: Houses the voice interaction and product recommendation features
- Not Found page: Displays when users navigate to non-existent routes

### Data Flow

- The application maintains conversation state in a central context
- Messages are stored with sender information and unique IDs
- Product data is fetched based on conversation content

### User Experience Flow

- Users start by activating the voice recorder
- Their speech is processed and displayed as text
- The system responds with messages
- After conversation, relevant products are shown

The project uses CSS through Tailwind for styling and is designed to work well on both mobile and desktop devices.
