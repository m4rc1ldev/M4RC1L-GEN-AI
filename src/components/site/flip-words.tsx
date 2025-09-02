"use client";
import { useEffect, useState } from "react";

export function FlipWords({
  words,
  interval = 1800,
  className,
}: {
  words: string[];
  interval?: number;
  className?: string;
}) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % words.length), interval);
    return () => clearInterval(t);
  }, [interval, words.length]);
  return (
    <span className={"relative inline-block overflow-hidden align-baseline " + (className || "")}
      aria-live="polite" aria-atomic="true">
      <span key={idx}
        className="inline-block will-change-transform animate-[flip_600ms_ease] [transform-style:preserve-3d]">
        {words[idx]}
      </span>
      <style jsx>{`
        @keyframes flip {
          0% { transform: rotateX(0); }
          49% { transform: rotateX(90deg); opacity: 0.2; }
          51% { transform: rotateX(-90deg); opacity: 0.2; }
          100% { transform: rotateX(0); }
        }
      `}</style>
    </span>
  );
}
