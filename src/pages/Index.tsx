import React, { useState, useCallback, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import AudioWaveform from "../components/AudioWaveform";
import VoiceRecorder from "../components/VoiceRecorder";
import ConversationDisplay from "../components/ConversationDisplay";
import { useGlobalContext } from "../hooks/useGlobalContext";
import { PRODUCT_LIST_URL } from "../components/constants";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { CSSTransition, TransitionGroup } from "react-transition-group";

const queryClient = new QueryClient();

const Index = () => {
  const [isRecording, setIsRecording] = useState(false);
  const { messages, conversationId } = useGlobalContext();

  const fetchProductList = useCallback(async () => {
    const response = await fetch(`${PRODUCT_LIST_URL}/${conversationId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.json();
  }, [conversationId]);

  const { data, error, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["productList"],
    queryFn: fetchProductList,
    enabled: false, // Disable automatic fetching
  });

  const onConversationEnd = useCallback(async () => {
    try {
      await refetch();
    } catch (error) {
      console.error("Error fetching product list:", error);
    }
  }, [refetch]);

  return (
    <QueryClientProvider client={queryClient}>
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
            onConversationEnd={onConversationEnd}
          />

          {/* Conversation Display */}
          {isFetching ? (
            <div>isLoading</div>
          ) : (
            <div
              className={`w-full px-3 sm:px-0  
                ${
                  isFetching
                    ? "animate-out fade-out duration-500"
                    : "animate-in fade-in duration-1000"
                } `}
            >
              <ConversationDisplay messages={messages} />
            </div>
          )}
        </div>
      </div>
      <ReactQueryDevtools />
    </QueryClientProvider>
  );
};

export default Index;
