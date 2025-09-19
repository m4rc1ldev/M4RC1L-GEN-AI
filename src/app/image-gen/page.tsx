"use client";
import { PollinationsImageGen } from "@/components/features/image-gen";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/common/theme-toggle";

export default function ImageGenPage() {
  return (
    <main className="min-h-screen w-full relative overflow-x-hidden">
      <section className="mx-auto w-full max-w-7xl px-6 py-12 md:py-16">
        <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <h1 className="font-mono text-3xl font-bold tracking-tight md:text-4xl">Image Generation</h1>
            <p className="font-mono text-sm text-muted-foreground">
              Describe your idea. We’ll craft the image.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button asChild variant="outline" className="rounded-full font-mono">
              <Link href="/">Back to Home</Link>
            </Button>
          </div>
        </div>

        <PollinationsImageGen />
      </section>
    </main>
  );
}
