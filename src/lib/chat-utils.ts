// lib/chat-utils.ts
import type { ChatMessage, ChatThread } from "./types";

export function generateMessageId(suffix: "u" | "a" = "a"): string {
  return `${Date.now()}${suffix}`;
}

export function createUserMessage(text: string): ChatMessage {
  return {
    id: generateMessageId("u"),
    role: "user",
    text,
    time: Date.now(),
  };
}

export function createAssistantMessage(text: string = ""): ChatMessage {
  return {
    id: generateMessageId("a"),
    role: "assistant", 
    text,
    time: Date.now(),
  };
}

export function createNewThread(title: string = "New chat"): ChatThread {
  return {
    id: `t${Date.now()}`,
    title,
    messages: [],
  };
}

export function updateMessageInThread(
  thread: ChatThread, 
  messageId: string, 
  updater: (message: ChatMessage) => ChatMessage
): ChatThread {
  return {
    ...thread,
    messages: thread.messages.map(msg => 
      msg.id === messageId ? updater(msg) : msg
    ),
  };
}

export function getLastUserMessage(messages: ChatMessage[]): ChatMessage | null {
  const userMessages = messages.filter(m => m.role === "user");
  return userMessages.length > 0 ? userMessages[userMessages.length - 1] : null;
}

export function generateThreadPreview(messages: ChatMessage[], maxLength: number = 40): string {
  const lastUserMessage = getLastUserMessage(messages);
  return lastUserMessage?.text?.slice(0, maxLength) || "No messages";
}