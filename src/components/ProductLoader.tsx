// components/ProductLoader.tsx
import React from "react";
import WebSocketLogs from "./WebSocketLogs";

export function ProductLoader({ sessionId }: { sessionId: string }) {
  return <WebSocketLogs sessionId={sessionId} isLoading={true} />;
}

export default ProductLoader;
