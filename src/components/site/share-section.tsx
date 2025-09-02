"use client";
import React, { useMemo, useState } from "react";
import { ShareButton, type ShareLink } from "@/components/ui/share-button";
import { Github, Twitter, Link2, Mail, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ShareSection() {
  const [copied, setCopied] = useState(false);

  const links = useMemo<ShareLink[]>(() => [
    {
      icon: Link2,
      label: "Copy link",
      onClick: async () => {
        try {
          await navigator.clipboard.writeText(window.location.href);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          // noop
        }
      },
    },
    {
      icon: Twitter,
      label: "Share on X",
      onClick: () => {
        const url = encodeURIComponent(window.location.href);
        const text = encodeURIComponent("Build anything faster with M4RC1L");
        window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, "_blank", "noopener,noreferrer");
      },
    },
    {
      icon: Github,
      label: "GitHub",
      href: "https://github.com/",
    },
    {
      icon: Mail,
      label: "Email",
      onClick: () => {
        const subject = encodeURIComponent("Check out M4RC1L");
        const body = encodeURIComponent(`I found M4RC1L useful for building quickly: ${window.location.href}`);
        window.location.href = `mailto:?subject=${subject}&body=${body}`;
      },
    },
  ], []);

  return (
    <section className="container mx-auto px-6 py-20">
      <div className="mx-auto max-w-3xl text-center">
        <h3 className="text-2xl md:text-3xl font-semibold tracking-tight">Share M4RC1L</h3>
        <p className="mt-3 text-sm md:text-base text-muted-foreground">
          If M4RC1L helps you move faster, share it with a friend or your team.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <ShareButton links={links} className="px-6 py-5 rounded-full">
            <Share2 className="h-4 w-4" />
            {copied ? "Link copied" : "Share now"}
          </ShareButton>
          <Button variant="outline" className="rounded-full" asChild>
            <a href="/M4RC1L">Open Chat</a>
          </Button>
        </div>
      </div>
    </section>
  );
}
