// lib/hooks/use-pollinations-models.ts
import { useState, useEffect } from "react";
import { fetchAvailableModels } from "@/lib/pollinations-api";

export function usePollinationsModels() {
  const [models, setModels] = useState<string[]>(["openai"]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadModels = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const availableModels = await fetchAvailableModels();
        
        if (mounted) {
          setModels(prev => Array.from(new Set([...prev, ...availableModels])));
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : "Failed to load models");
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    loadModels();

    return () => {
      mounted = false;
    };
  }, []);

  return { models, isLoading, error };
}