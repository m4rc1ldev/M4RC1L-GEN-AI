// lib/types.ts
export type ChatMessage = { 
  id: string; 
  role: "user" | "assistant"; 
  text: string; 
  time: number; 
};

export type ChatThread = { 
  id: string; 
  title: string; 
  messages: ChatMessage[]; 
};

export type StreamOptions = { 
  connectTimeoutMs?: number; 
};

export type StreamCallbacks = {
  onDelta: (chunk: string) => void;
  onDone: () => void;
};