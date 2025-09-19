"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MessageSquare, ArrowLeft } from "lucide-react";

export default function ChatPage() {
  return (
    <main className="min-h-screen w-full relative overflow-x-hidden">
      <section className="mx-auto w-full max-w-4xl px-6 py-12 md:py-16">
        <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <h1 className="font-mono text-3xl font-bold tracking-tight md:text-4xl">AI Chat</h1>
            <p className="font-mono text-sm text-muted-foreground">
              Intelligent conversations powered by advanced AI models.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" className="rounded-full font-mono">
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Link>
            </Button>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-6">
          <div className="p-8 rounded-2xl border bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
            <div className="space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <MessageSquare className="h-8 w-8 text-primary" />
              </div>
              <div className="space-y-2">
                <h2 className="font-mono text-xl font-semibold">Coming Soon</h2>
                <p className="font-mono text-sm text-muted-foreground max-w-md">
                  Our AI chat feature is currently under development. We're working hard to bring you
                  the best conversational AI experience.
                </p>
              </div>
              <div className="pt-4">
                <Button asChild variant="outline" className="rounded-full font-mono">
                  <Link href="/image-gen">
                    Try Image Generation Instead
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}