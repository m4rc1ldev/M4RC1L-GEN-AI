"use client";

import React, { useState, useCallback } from "react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Plus, Trash2, MessageSquare, Image as ImageIcon, Video, UploadCloud, Settings, Layers } from "lucide-react";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";// Import lib functions
import type { ChatThread } from "@/lib/types";
import { fetchNonStreamingResponse } from "@/lib/pollinations-api";
import { 
  createUserMessage, 
  createAssistantMessage, 
  createNewThread,
  generateThreadPreview 
} from "@/lib/chat-utils";
import { usePollinationsModels } from "@/hooks/use-pollinations-models";
import { useAutoScroll } from "@/hooks/use-auto-scroll";

export default function PollinationsChat({ initialSystem }: { initialSystem?: string }) {
  // Sidebar + threads
  const [threads, setThreads] = useState<ChatThread[]>([
    createNewThread("New chat")
  ]);
  const [activeId, setActiveId] = useState<string>(threads[0]?.id || "t1");

  // Current thread derived state
  const activeThread = threads.find(t => t.id === activeId);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Controls
  const { models } = usePollinationsModels();
  const [model, setModel] = useState("openai");
  // Streaming is disabled — always use non-streaming API

  // Auto-scroll to bottom on new messages
  const containerRef = useAutoScroll<HTMLDivElement>(activeThread?.messages);

  // Update messages in active thread
  const setActiveMessages = useCallback((updater: (messages: any[]) => any[]) => {
    setThreads(prev =>
      prev.map(thread =>
        thread.id === activeId
          ? { ...thread, messages: updater(thread.messages) }
          : thread
      )
    );
  }, [activeId]);

  const send = async () => {
    const prompt = input.trim();
    if (!prompt || loading || !activeThread) return;

    // Create user message
    const userMsg = createUserMessage(prompt);
    setActiveMessages(messages => [...messages, userMsg]);
    setInput("");
    setLoading(true);

    // Create assistant placeholder
    const assistantMsg = createAssistantMessage();
    setActiveMessages(messages => [...messages, assistantMsg]);

    try {
      // Non-streaming: fetch full response and update assistant placeholder
      const text = await fetchNonStreamingResponse(prompt, model);
      setActiveMessages(prevMessages =>
        prevMessages.map(msg =>
          msg.id === assistantMsg.id
            ? { ...msg, text }
            : msg
        )
      );
      setLoading(false);
    } catch {
      // Final safety: soft error in bubble
      setActiveMessages(prevMessages =>
        prevMessages.map(msg =>
          msg.id === assistantMsg.id
            ? { ...msg, text: msg.text || "Sorry, something went wrong." }
            : msg
        )
      );
      setLoading(false);
    }
  };

  // Sidebar helpers
  const newChat = useCallback(() => {
    const newThread = createNewThread("New chat");
    setThreads(threads => [newThread, ...threads]);
    setActiveId(newThread.id);
  }, []);

  const deleteChat = useCallback((threadId: string) => {
    setThreads(threads => threads.filter(t => t.id !== threadId));
    if (threadId === activeId && threads.length > 1) {
      const remainingThread = threads.find(t => t.id !== threadId);
      if (remainingThread) {
        setActiveId(remainingThread.id);
      }
    }
  }, [activeId, threads]);

  if (!activeThread) return null;

  return (
    <main className="min-h-screen w-full bg-white dark:bg-neutral-900">
      <div className={cn(
        "mx-auto flex w-full h-svh overflow-hidden",
        "bg-neutral-100 dark:bg-neutral-800"
      )}>
        {/* Sidebar (shadcn) */}
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen}>
          <SidebarBody className="justify-between gap-6">
            <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
              {/* Navigation links */}
              <nav className="px-3 space-y-1">
                {/* Quick actions */}
                <button
                  onClick={newChat}
                  className="w-full flex items-center gap-2 py-2 px-3 rounded-md hover:bg-neutral-200/50 dark:hover:bg-neutral-700/50 transition"
                >
                  <Plus className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: sidebarOpen ? 1 : 0 }}
                    className="text-sm text-neutral-800 dark:text-neutral-200"
                  >
                    New Chat
                  </motion.span>
                </button>

                <div className="h-px bg-neutral-200/50 dark:bg-neutral-700/50 my-3" />

                {/* Main navigation */}
                <SidebarLink
                  link={{ 
                    label: "Image Gen", 
                    href: "/imagegen", 
                    icon: <ImageIcon className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
                  }}
                />              
                <SidebarLink
                  link={{ 
                    label: "Settings", 
                    href: "/settings", 
                    icon: <Settings className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
                  }}
                />
              </nav>

              {/* Recent chats section */}
              <div className="mt-6 relative">
                {/* Section header - always visible */}
                <div className="px-5 mb-2 flex items-center">
                  <MessageSquare className="h-4 w-4 text-neutral-500 dark:text-neutral-400 mr-2" />
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: sidebarOpen ? 1 : 0 }}
                    className="text-xs font-medium text-neutral-500 dark:text-neutral-400"
                  >
                    Recent Chats
                  </motion.span>
                </div>

                {/* Chat list - conditionally visible */}
                <motion.div 
                  className="space-y-1 px-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: sidebarOpen ? 1 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {threads.map((thread) => (
                    <button
                      key={thread.id}
                      onClick={() => setActiveId(thread.id)}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-md border transition",
                        thread.id === activeId
                          ? "bg-neutral-200/50 border-neutral-300 dark:bg-neutral-700/50 dark:border-neutral-600"
                          : "bg-transparent border-transparent hover:bg-neutral-200/30 dark:hover:bg-neutral-700/30"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="truncate text-sm text-neutral-800 dark:text-neutral-200">
                          {thread.title || "Untitled"}
                        </span>
                        <Trash2
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteChat(thread.id);
                          }}
                          className="h-4 w-4 text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
                        />
                      </div>
                      {sidebarOpen && (
                        <div className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                          {generateThreadPreview(thread.messages)}
                        </div>
                      )}
                    </button>
                  ))}
                </motion.div>
              </div>
            </div>

            {/* Footer - responsive behavior */}
            <motion.div 
              className="mt-auto px-3 py-3 text-xs border-t border-neutral-200/50 dark:border-neutral-700/50"
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: sidebarOpen ? 1 : 0,
                height: sidebarOpen ? "auto" : 0,
                marginTop: sidebarOpen ? "auto" : 0
              }}
              transition={{ duration: 0.2 }}
            >
              <span className="text-neutral-500 dark:text-neutral-400">
                Powered by OpenAI
              </span>
            </motion.div>
          </SidebarBody>
        </Sidebar>

        {/* Main content */}
        <div className="flex flex-1 flex-col bg-white dark:bg-neutral-900">
          {/* Header */}
          <header className="sticky top-0 z-10 border-b border-neutral-200 dark:border-neutral-700 bg-white/95 dark:bg-neutral-900/95 backdrop-blur supports-[backdrop-filter]:bg-white/75 dark:supports-[backdrop-filter]:bg-neutral-900/75">
            <div className="flex items-center justify-between px-4 py-3">
              <h1 className="text-sm font-semibold tracking-tight text-neutral-800 dark:text-neutral-200">
                Pollinations Chat
              </h1>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Label htmlFor="model" className="text-xs text-neutral-600 dark:text-neutral-400">Model</Label>
                  <Select value={model} onValueChange={setModel}>
                    <SelectTrigger id="model" className="h-9 w-44 bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-600">
                      <SelectValue placeholder="Select model" />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-neutral-800 dark:border-neutral-700">
                      {models.map((m) => (
                        <SelectItem key={m} value={m}>{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </header>

      {/* Messages */}
          <ScrollArea className="flex-1">
            <div className="px-4 py-4 overflow-hidden" ref={containerRef}>
              {activeThread.messages.length === 0 && (
                <div className="text-sm text-neutral-500 dark:text-neutral-400">
                  Start a conversation — ask anything.
                </div>
              )}
              <div className="space-y-3">
                {activeThread.messages.map((message) => {
                  const isUser = message.role === "user";
                  return (
                    <div
                      key={message.id}
                      className={cn(
                        "max-w-[85%] rounded-2xl border px-4 py-3 whitespace-pre-wrap shadow-sm",
                        isUser
                          ? "ml-auto bg-neutral-100 border-neutral-200 dark:bg-neutral-800 dark:border-neutral-700"
                          : "mr-auto bg-white border-neutral-200 dark:bg-neutral-900 dark:border-neutral-700"
                      )}
                      aria-live="polite"
                    >
                      <div className="mb-1 text-[10px] uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                        {isUser ? "User" : "AI"}
                      </div>
                      <div className="text-neutral-800 dark:text-neutral-200">{message.text}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </ScrollArea>

          {/* Composer */}
          <footer
            className="sticky bottom-0 border-t border-neutral-200 dark:border-neutral-700 bg-white/95 dark:bg-neutral-900/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-white/75 dark:supports-[backdrop-filter]:bg-neutral-900/75"
            style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
          >
            <div className="flex w-full items-center gap-2">
              <input
                className="h-10 flex-1 rounded-md border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-3 text-sm text-neutral-800 dark:text-neutral-200 outline-none ring-0 transition focus:border-neutral-400 dark:focus:border-neutral-500"
                placeholder="Type a message"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
              />
              <Button 
                onClick={send} 
                disabled={loading}
                className="bg-neutral-800 hover:bg-neutral-700 dark:bg-white/90 dark:hover:bg-white/80 dark:text-neutral-900"
              >
                {loading ? <Loader2 className="animate-spin" /> : "Send"}
              </Button>
            </div>
          </footer>
        </div>
      </div>
    </main>
  );
}