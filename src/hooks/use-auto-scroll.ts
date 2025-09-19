// lib/hooks/use-auto-scroll.ts  
import { useEffect, useRef } from "react";

export function useAutoScroll<T extends HTMLElement = HTMLDivElement>(dependency?: unknown) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (element) {
      element.scrollTop = element.scrollHeight;
    }
  }, [dependency]);

  return ref;
}