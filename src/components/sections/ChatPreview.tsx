"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
  ChatInput,
  ChatInputSubmit,
  ChatInputTextArea,
} from "@/components/ui/chat-input";
import { useState } from "react";


export function ChatPreview() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = () => {
    setLoading(true);
    // Simulate brief interaction then redirect to real chat page
    setTimeout(() => {
      router.push("/M4RC1L");
    }, 400);
  };

  return (
    <section className="relative w-full min-h-[70vh] flex flex-col items-center justify-center px-4 py-24 bg-[#] border-t border-white/5">
      <div className="max-w-3xl w-full flex flex-col items-center text-center">
       
        <p className="text-sm md:text-base text-black/60 mb-10 leading-relaxed font-mono max-w-xl">
          If M4RC1L accelerates your creative flow, let someone know. Launch an instant chat session or share a link—every conversation helps models adapt, refine reasoning, and sharpen multimodal generation quality.
        </p>
        <div className="flex gap-4 mb-14 flex-wrap justify-center">
          <Button variant="outline" asChild className="rounded-full font-mono px-6 h-11 cursor-pointer font-light bg-white text-black hover:bg-black hover:text-white transition-colors duration-300 ease-in-out">
            <Link href="/">Share now</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-full  font-mono px-6 h-11 cursor-pointer font-light bg-white text-black hover:bg-black hover:text-white transition-colors duration-300 ease-in-out">
            <Link href="/chat">Open Chat</Link>
          </Button>
        </div>
        <div className="w-full max-w-xl ">
          <ChatInput
            className="shadow"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onSubmit={handleSubmit}
            onStop={() => setLoading(false)}
            loading={loading}
            variant="default"
          >
            <ChatInputTextArea placeholder="Type a message... " />
            <ChatInputSubmit />
          </ChatInput>
         
        </div>
      </div>
    </section>
  );
}
