"use client";

// Moved chat interface from previous "/" route
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { Plus, Settings, Trash2, Send, Loader2 } from "lucide-react";

type Msg = { role: "user" | "assistant"; content: string; think?: string };
type ReqMessage = { role: "system" | "user" | "assistant" | "tool"; content: string };
type ChatCompletionChunk = {
  choices?: Array<{
  delta?: { content?: string };
  message?: { content?: string };
  }>;
};

type Session = {
  id: string;
  title: string;
  messages: Msg[];
};

const ALLOWED = [
  { id: "moonshotai/kimi-vl-a3b-thinking:free", label: "Kimi K2 ( thinking )" },
  { id: "moonshotai/kimi-k2:free", label: "Kimi K2" },
  { id: "mistralai/mistral-7b-instruct:free", label: "M4RC1L flash" },
];
const THINK_MODEL = "moonshotai/kimi-vl-a3b-thinking:free";
const DEFAULT_MODEL = "mistralai/mistral-7b-instruct:free";

function extractImageUrlsFromText(text: string): string[] {
  const urls = new Set<string>();
  const urlRegex = /(https?:\/\/[^\s)]+\.(?:png|jpe?g|gif|webp))/gi;
  let m: RegExpExecArray | null;
  while ((m = urlRegex.exec(text)) !== null) urls.add(m[1]);
  const dataRegex = /(data:image\/(?:png|jpeg|webp);base64,[A-Za-z0-9+/=]+)/gi;
  while ((m = dataRegex.exec(text)) !== null) urls.add(m[1]);
  return Array.from(urls);
}

export default function M4RC1LPage() {
  const [model, setModel] = useState<string>(DEFAULT_MODEL);
  // sessions are in-memory only; refresh clears them
  const [sessions, setSessions] = useState<Session[]>([{ id: "s-1", title: "New chat", messages: [] }]);
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const listEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [thinking, setThinking] = useState(false);
  const suppressRef = useRef(false);
  const thinkCloseRef = useRef<string | null>(null);
  const [thinkMode, setThinkMode] = useState(false);
  const [wikiMode, setWikiMode] = useState(false);
  const typingQueueRef = useRef<string>("");
  const typingTimerRef = useRef<number | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const idCounterRef = useRef(2);

  const activeMessages = sessions[active]?.messages ?? [];

  const stripAllThinkMarkers = (text: string): string => {
    let out = text;
    const variants: Array<{ open: string; close: string }> = [
      { open: "◁think▶", close: "◁/think▶" },
      { open: "◁think▷", close: "◁/think▷" },
      { open: "<think>", close: "</think>" },
    ];
    for (const { open, close } of variants) {
      while (true) {
        const s = out.indexOf(open);
        if (s === -1) break;
        const e = out.indexOf(close, s + open.length);
        if (e === -1) {
          out = out.slice(0, s);
          break;
        }
        out = out.slice(0, s) + out.slice(e + close.length);
      }
    }
    return out;
  };

  const extractThinkOnly = (text: string): string => {
    const variants: Array<{ open: string; close: string }> = [
      { open: "◁think▶", close: "◁/think▶" },
      { open: "◁think▷", close: "◁/think▷" },
      { open: "<think>", close: "</think>" },
    ];
    for (const { open, close } of variants) {
      const s = text.indexOf(open);
      if (s !== -1) {
        const e = text.indexOf(close, s + open.length);
        if (e !== -1) return text.slice(s + open.length, e);
        return text.slice(s + open.length);
      }
    }
    return "";
  };

  useEffect(() => {
    return () => {
      if (typingTimerRef.current) {
        window.clearInterval(typingTimerRef.current);
        typingTimerRef.current = null;
      }
    };
  }, []);

  const canSend = useMemo(() => !!model && !loading, [model, loading]);

  useEffect(() => {
    // Keep view pinned to the latest message
    listEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [activeMessages]);

  async function sendStreaming(content: string, attempt = 0) {
    setBanner(null);
    setLoading(true);
    setThinking(false);
    suppressRef.current = false;
    const userMsg: Msg = { role: "user", content };
  const assistantMsg: Msg = { role: "assistant", content: "", think: "" };
    const currentIndex = active;
    if (attempt === 0) {
      setSessions((prev) => {
        const copy = [...prev];
        const s = copy[currentIndex];
        if (!s) return prev;
        const nextTitle = s.title === "New chat" && content ? (content.length > 40 ? content.slice(0, 40) + "…" : content) : s.title;
        copy[currentIndex] = { ...s, title: nextTitle, messages: [...s.messages, userMsg, assistantMsg] };
        return copy;
      });
    }

    try {
      const toSendBase: ReqMessage[] = [
        ...((sessions[currentIndex]?.messages ?? []) as unknown as ReqMessage[]),
        userMsg,
      ];
      const extra: ReqMessage[] = wikiMode
        ? [{ role: "system", content: "When helpful, ground answers in factual knowledge and provide brief citations or pointers." }]
        : [];
      const messagesToSend: ReqMessage[] = [...extra, ...toSendBase];

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model, messages: messagesToSend, stream: true }),
      });

      if (!res.ok || !res.body) {
        if (res.status === 424) setBanner("Selected model is unavailable right now. Pick another.");
        const text = await res.text().catch(() => "");
        throw new Error(text || `HTTP ${res.status}`);
      }

  const chosenModel = model;
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      const appendThink = (chunk: string) => {
        if (!chunk) return;
        setSessions((prev) => {
          const arr = [...prev];
          const s = arr[currentIndex];
          if (!s) return prev;
          const msgs = [...s.messages];
          const li = msgs.length - 1;
          const last = msgs[li];
          if (last && last.role === "assistant") {
            msgs[li] = { ...last, think: (last.think || "") + chunk };
            arr[currentIndex] = { ...s, messages: msgs };
          }
          return arr;
        });
      };
      const stripThinkSegments = (text: string): string => {
        let t = text;
        const variants: Array<{ open: string; close: string }> = [
          { open: "◁think▶", close: "◁/think▶" },
          { open: "◁think▷", close: "◁/think▷" },
          { open: "<think>", close: "</think>" },
        ];
        const findFirstOpen = (str: string): { idx: number; open: string; close: string } | null => {
          let bestIdx = Infinity;
          let bestPair: { open: string; close: string } | null = null;
          for (const p of variants) {
            const i = str.indexOf(p.open);
            if (i !== -1 && i < bestIdx) {
              bestIdx = i;
              bestPair = p;
            }
          }
          return bestPair ? { idx: bestIdx, open: bestPair.open, close: bestPair.close } : null;
        };

        let cleaned = "";
        while (t.length) {
          if (!suppressRef.current) {
            const found = findFirstOpen(t);
            if (!found) {
              cleaned += stripAllThinkMarkers(t);
              break;
            }
            // keep visible content before open
            cleaned += t.slice(0, found.idx);
            // enter suppress mode
            suppressRef.current = true;
            thinkCloseRef.current = found.close;
            setThinking(true);
            // drop the open marker and continue parsing remainder
            t = t.slice(found.idx + found.open.length);
          }
          if (suppressRef.current) {
            const closeToken = thinkCloseRef.current || "";
            const end = closeToken ? t.indexOf(closeToken) : -1;
            if (end !== -1) {
              const thinkChunk = t.slice(0, end);
              if (thinkChunk) appendThink(thinkChunk);
              // drop close token
              t = t.slice(end + closeToken.length);
              suppressRef.current = false;
              thinkCloseRef.current = null;
              setThinking(false);
              // continue loop to look for more opens in remaining t
              continue;
            } else {
              // all is thinking content for now
              appendThink(t);
              return cleaned; // no visible content in this chunk after open
            }
          }
        }
        return cleaned;
      };
      const updateAssistant = (delta: string) => {
        const cleaned = stripThinkSegments(delta);
        if (!cleaned) return;
        const isThinkingModel = chosenModel === THINK_MODEL;
        if (isThinkingModel) {
          typingQueueRef.current += cleaned;
          if (!typingTimerRef.current) {
            typingTimerRef.current = window.setInterval(() => {
              const ch = typingQueueRef.current.slice(0, 1);
              typingQueueRef.current = typingQueueRef.current.slice(1);
              if (!ch) {
                if (typingTimerRef.current) {
                  window.clearInterval(typingTimerRef.current);
                  typingTimerRef.current = null;
                }
                return;
              }
              setSessions((prev) => {
                const arr = [...prev];
                const s = arr[currentIndex];
                if (!s) return prev;
                const msgs = [...s.messages];
                const li = msgs.length - 1;
                const last = msgs[li];
                if (last && last.role === "assistant") {
                  msgs[li] = { ...last, content: (last.content || "") + ch };
                  arr[currentIndex] = { ...s, messages: msgs };
                }
                return arr;
              });
            }, 8);
          }
        } else {
          setSessions((prev) => {
            const arr = [...prev];
            const s = arr[currentIndex];
            if (!s) return prev;
            const msgs = [...s.messages];
            const li = msgs.length - 1;
            const last = msgs[li];
            if (last && last.role === "assistant") {
              msgs[li] = { ...last, content: (last.content || "") + cleaned };
              arr[currentIndex] = { ...s, messages: msgs };
            }
            return arr;
          });
        }
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        const lines = acc.split(/\r?\n/);
        acc = lines.pop() || "";
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;
          if (trimmed.startsWith("data:")) {
            const dataStr = trimmed.slice(5).trim();
            if (dataStr === "[DONE]") continue;
            try {
              const json: unknown = JSON.parse(dataStr);
              let delta = "";
              let reasoning = "";
              if (
                typeof json === "object" &&
                json !== null &&
                "choices" in json &&
                Array.isArray((json as { choices?: unknown }).choices)
              ) {
                type Choice = { delta?: { content?: string; reasoning?: string; reasoning_content?: string }; message?: { content?: string } };
                const choices = (json as { choices: Choice[] }).choices;
                const first: Choice | undefined = choices[0];
                reasoning = first?.delta?.reasoning_content || first?.delta?.reasoning || "";
                delta = first?.delta?.content ?? first?.message?.content ?? "";
              }
              if (reasoning) {
                setThinking(true);
                appendThink(reasoning);
              }
              if (delta) {
                setThinking(false);
                updateAssistant(delta);
              }
            } catch {
            }
          }
        }
      }
    } catch (e: unknown) {
      const msg = e && typeof e === "object" && "message" in e && typeof (e as { message?: unknown }).message === "string"
        ? (e as { message: string }).message
        : "Unknown";
      const currentIndex = active;
      setSessions((prev) => {
        const arr = [...prev];
        const s = arr[currentIndex];
        if (!s) return prev;
        arr[currentIndex] = { ...s, messages: [...s.messages, { role: "assistant", content: `Error: ${String(msg)}` }] };
        return arr;
      });
    } finally {
      setLoading(false);
      setTimeout(() => listEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }), 0);
    }
  }

  return (
    <div className="min-h-screen bg-muted/20">
      <TooltipProvider>
        <ResizablePanelGroup direction="horizontal" className="h-screen">
          <ResizablePanel defaultSize={24} minSize={18} maxSize={32} className="hidden md:flex flex-col border-r bg-background/60">
            <div className="p-3 border-b flex items-center justify-between">
              <div className="font-semibold tracking-tight">M4RC1L</div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="icon" variant="ghost" onClick={() => setShowSettings((v) => !v)}><Settings className="h-4 w-4" /></Button>
                </TooltipTrigger>
                <TooltipContent>Settings</TooltipContent>
              </Tooltip>
            </div>
            <div className="p-3">
              <Button
                className="w-full"
                variant="secondary"
                onClick={() => {
                  setSessions((prev) => {
                    const nextId = `s-${idCounterRef.current++}`;
                    const next: Session = { id: nextId, title: "New chat", messages: [] };
                    if (prev.length >= 5) {
                      const trimmed = [...prev.slice(1), next];
                      setActive(trimmed.length - 1);
                      return trimmed;
                    }
                    const updated = [...prev, next];
                    setActive(updated.length - 1);
                    return updated;
                  });
                }}
              >
                <Plus className="h-4 w-4 mr-2" /> New Chat
              </Button>
            </div>
            <div className="px-3 text-xs uppercase tracking-wider opacity-60">History</div>
            <ScrollArea className="flex-1 p-2">
              <div className="space-y-2 text-sm">
                {sessions.map((s, i) => (
                  <div
                    key={s.id}
                    onClick={() => setActive(i)}
                    className={`flex items-center justify-between gap-2 rounded-md border px-3 py-2 hover:bg-accent/50 cursor-pointer ${i === active ? "bg-accent/40 border-accent" : "bg-background"}`}
                  >
                    <div className="truncate">{s.title || `Chat ${i + 1}`}</div>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSessions((prev) => {
                          const arr = [...prev];
                          arr.splice(i, 1);
                          // adjust active index
                          setActive((cur) => Math.max(0, Math.min(cur, arr.length - 1)));
                          return arr.length ? arr : [{ id: "s-1", title: "New chat", messages: [] }];
                        });
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
            {showSettings && (
              <div className="p-3 border-t space-y-3">
                <div className="text-xs uppercase tracking-wider opacity-60">Settings</div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={thinkMode ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setThinkMode((v) => {
                        const next = !v;
                        if (next) setModel(THINK_MODEL);
                        else if (model === THINK_MODEL) setModel(DEFAULT_MODEL);
                        return next;
                      });
                    }}
                  >
                    Think
                  </Button>
                  <Button type="button" variant={wikiMode ? "default" : "outline"} size="sm" onClick={() => setWikiMode((v) => !v)}>Wiki</Button>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSessions([{ id: "s-1", title: "New chat", messages: [] }]);
                    setActive(0);
                  }}
                >
                  Clear all chats
                </Button>
              </div>
            )}
            <div className="p-3 border-t flex items-center gap-3">
              <Avatar>
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
              <div className="text-sm">
                <div className="font-medium">You</div>
                <div className="text-xs opacity-60">Starter</div>
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          <ResizablePanel defaultSize={76} minSize={50}>
            <div className="h-screen flex flex-col min-h-0">
              <div className="px-4 pt-4">
                {activeMessages.length === 0 && (
                  <div className="text-center text-4xl font-semibold tracking-tight opacity-80">M4RC1L</div>
                )}
                {banner && (
                  <div className="mt-3 border rounded bg-yellow-50 dark:bg-yellow-950/30 text-yellow-800 dark:text-yellow-200 px-3 py-2 text-sm text-center">
                    {banner}
                  </div>
                )}
              </div>

              <div className="flex-1 px-4 py-4 min-h-0">
                <div className="h-full rounded border bg-background/60 overflow-hidden flex flex-col min-h-0">
                  <ScrollArea className="flex-1 min-h-0 w-full overscroll-contain">
                    <div ref={listRef} className="p-4 space-y-4">
                      {activeMessages.length === 0 ? (
                        <div className="text-center text-sm opacity-60 mt-8">What&apos;s on your mind?</div>
                      ) : (
                        activeMessages.map((m, i) => {
                          const isUser = m.role === "user";
                          const isLast = i === activeMessages.length - 1;
                          return (
                            <div key={i} className={`flex min-w-0 items-start gap-3 ${isUser ? "justify-end" : ""}`}>
                              {!isUser && (
                                <Avatar><AvatarFallback>A</AvatarFallback></Avatar>
                              )}
                              <div
                                className={`min-w-0 max-w-[calc(100%-4rem)] sm:max-w-[80%] overflow-hidden rounded-lg px-3 py-2 whitespace-pre-wrap break-words hyphens-none ${isUser ? "bg-primary text-primary-foreground" : "bg-muted"}`}
                                style={{ overflowWrap: "break-word", wordBreak: "normal" }}
                              >
                                {/* Main response without thinking markers */}
                                {stripAllThinkMarkers(m.content)}
                                {/* Optional thinking accordion for assistant messages */}
                                {!isUser && (m.think?.trim() || extractThinkOnly(m.content).trim()) && (
                                  <details className="mt-2 rounded-md border bg-background/60">
                                    <summary className="cursor-pointer select-none px-2 py-1 text-xs font-medium opacity-80">
                                      Show thinking
                                    </summary>
                                    <div className="px-3 pb-2 pt-1 text-xs opacity-80 whitespace-pre-wrap break-words" style={{ overflowWrap: "break-word", wordBreak: "normal" }}>
                                      {(m.think && m.think.trim()) ? m.think : extractThinkOnly(m.content)}
                                    </div>
                                  </details>
                                )}
                                {!isUser && (() => { const imgs = extractImageUrlsFromText(m.content); return imgs.length ? (
                                  <div className="mt-2 grid grid-cols-2 gap-2">
                                    {imgs.map((url, idx) => (
                                      <img key={idx} src={url} alt="Generated" className="rounded-md border max-w-full h-auto object-contain" />
                                    ))}
                                  </div>
                                ) : null; })()}
                              </div>
                              {isUser && (
                                <Avatar><AvatarFallback>U</AvatarFallback></Avatar>
                              )}
                            </div>
                          );
                        })
                      )}
                      {(thinking || loading) && (
                        <div className="flex min-w-0 items-start gap-3">
                          <Avatar><AvatarFallback>A</AvatarFallback></Avatar>
                          <div className="min-w-0 max-w-[calc(100%-4rem)] sm:max-w-[80%] overflow-hidden rounded-lg px-3 py-2 bg-muted">
                            <div className="flex items-center gap-2 text-sm opacity-70">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              {thinking ? "Thinking…" : "Generating response…"}
                            </div>
                          </div>
                        </div>
                      )}
                      <div ref={listEndRef} />
                      <div className="h-0" />
                    </div>
                  </ScrollArea>
                </div>
              </div>

              <div className="px-4 pb-4">
                <div className="rounded-2xl border p-3 bg-background shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <Button
                      type="button"
                      variant={thinkMode ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setThinkMode((v) => {
                          const next = !v;
                          if (next) setModel(THINK_MODEL);
                          else if (model === THINK_MODEL) setModel(DEFAULT_MODEL);
                          return next;
                        })
                      }}
                    >
                      Think
                    </Button>
                    <Button type="button" variant={wikiMode ? "default" : "outline"} size="sm" onClick={() => setWikiMode((v) => !v)}>Wiki</Button>
                  </div>
                  <form
                    className="flex items-center gap-2"
                    onSubmit={(e) => {
                      e.preventDefault();
                      const form = e.currentTarget as HTMLFormElement & { prompt?: HTMLInputElement };
                      const value = form.prompt?.value?.trim() || "";
                      if (value && canSend) {
                        sendStreaming(value);
                        if (form.prompt) form.prompt.value = "";
                        inputRef.current?.focus();
                      }
                    }}
                  >
                    <Input ref={inputRef} name="prompt" placeholder="What's on your mind?" disabled={!canSend} className="flex-1" />
                    <Select value={model} onValueChange={setModel}>
                      <SelectTrigger className="min-w-[260px]"><SelectValue placeholder="Select model" /></SelectTrigger>
                      <SelectContent>
                        {ALLOWED.map((m) => (
                          <SelectItem key={m.id} value={m.id}>{m.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button type="submit" disabled={!canSend} className="rounded-full px-4"><Send className="h-4 w-4" /></Button>
                  </form>
                  {activeMessages.length === 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {["Explain a concept", "Translate a sentence", "Solve a math problem", "Write sample code"].map((s) => (
                        <Button key={s} variant="secondary" size="sm" type="button" onClick={() => inputRef.current && (inputRef.current.value = s)}>{s}</Button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </TooltipProvider>
    </div>
  );
}
