"use client";
import React, {
  useState,
  useCallback,
  forwardRef,
  useImperativeHandle,
  useMemo,
} from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Download, Loader2, RefreshCw, Wand2, Link as LinkIcon } from "lucide-react";

// Simple list fetched from docs reference; could be dynamically loaded from /models endpoint later.
const MODELS = [
  "flux",
  "flux-2",
  "flux-realism",
  "flux-anime",
  "kontext",
]; // placeholder guesses; adjust to actual list after hitting /models

type RatioKey = "1:1" | "16:9" | "4:5" | "9:16" | "3:2";
const RATIOS: Record<RatioKey, number> = {
  "1:1": 1,
  "16:9": 16 / 9,
  "4:5": 4 / 5,
  "9:16": 9 / 16,
  "3:2": 3 / 2,
};

type SizeKey = "S" | "M" | "L" | "XL";
const SIZES: Record<SizeKey, number> = {
  S: 512,
  M: 768,
  L: 1024,
  XL: 1280,
};

interface GenParams {
  prompt: string;
  model: string;
  width: number;
  height: number;
  seed?: number | null;
  enhance: boolean;
  safe: boolean;
  private: boolean;
}

export interface PollinationsImageGenProps {
  controlledParams?: GenParams;
  onParamsChange?: (p: GenParams) => void;
  hidePrompt?: boolean;
  hideControls?: boolean;
}

export const PollinationsImageGen = forwardRef(function PollinationsImageGen(
  props: PollinationsImageGenProps,
  ref: React.Ref<{ generate: () => void }>
) {
  const { controlledParams, onParamsChange, hidePrompt, hideControls } = props;
  const isControlled = Boolean(controlledParams && onParamsChange);
  const [internalParams, setInternalParams] = useState<GenParams>({
    prompt: "A cinematic atmospheric neon-lit alley with rain and reflections",
    model: "flux",
    // Use 640x360 for 16:9 and smaller web-friendly default
    width: 640,
    height: 360,
    seed: null,
    enhance: false,
    safe: false,
    private: false,
  });
  const params = isControlled ? controlledParams! : internalParams;
  const setParams = (u: Partial<GenParams> | ((p: GenParams) => GenParams)) => {
    if (isControlled) {
      const next = typeof u === 'function' ? u(controlledParams!) : { ...controlledParams!, ...u };
      onParamsChange!(next);
    } else {
      setInternalParams((p) => (typeof u === 'function' ? u(p) : { ...p, ...u }));
    }
  };
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requestedUrl, setRequestedUrl] = useState<string | null>(null);

  // Derived UI state: ratio + size buttons keep width/height sensible
  const currentRatio = useMemo<RatioKey>(() => {
    const r = params.width / params.height;
    // Find closest ratio
    let best: RatioKey = "16:9";
    let bestDiff = Infinity;
    (Object.keys(RATIOS) as RatioKey[]).forEach((k) => {
      const diff = Math.abs(RATIOS[k] - r);
      if (diff < bestDiff) {
        bestDiff = diff;
        best = k;
      }
    });
    return best;
  }, [params.width, params.height]);

  const buildUrl = useCallback(() => {
    if (!params.prompt.trim()) return null;
    const encoded = encodeURIComponent(params.prompt.trim());
    const base = `https://image.pollinations.ai/prompt/${encoded}`;
    const searchParams = new URLSearchParams();
  if (params.model && params.model !== 'flux') searchParams.set('model', params.model);
  // Always include width/height so upstream respects the requested aspect/size
  searchParams.set('width', String(params.width));
  searchParams.set('height', String(params.height));
    if (params.seed != null && params.seed !== undefined) searchParams.set('seed', String(params.seed));
    if (params.enhance) searchParams.set('enhance', 'true');
    if (params.safe) searchParams.set('safe', 'true');
    if (params.private) searchParams.set('private', 'true');
    // For MVP: no nologo/referrer included
    const qs = searchParams.toString();
    return qs ? `${base}?${qs}` : base;
  }, [params]);

  const generate = async () => {
    const url = buildUrl();
    if (!url) return;
    setLoading(true);
    setError(null);
    setImgUrl(null);
    setRequestedUrl(url);
    try {
      // We can directly set the image URL—browser will stream it.
      // To force refresh (avoid cache), append a cache buster.
      const withBust = url + (url.includes('?') ? '&' : '?') + 't=' + Date.now();
      setImgUrl(withBust);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Unknown error';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useImperativeHandle(ref, () => ({
    generate,
  }));

  const downloadImage = async () => {
    if (!imgUrl) return;
    try {
      const res = await fetch(imgUrl);
      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'pollinations_generated.jpg';
      a.click();
      URL.revokeObjectURL(a.href);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Failed to download';
      setError(message);
    }
  };

  return (
    <div className="w-full h-full">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Controls */}
        <aside className="lg:col-span-5">
          <div className="sticky top-20 rounded-2xl border bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/40">
            <div className="p-4 sm:p-6">
              {!hidePrompt && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-mono tracking-wide text-muted-foreground">Prompt</Label>
                    <Textarea
                      value={params.prompt}
                      onChange={(e) => setParams((p) => ({ ...p, prompt: e.target.value }))}
                      placeholder="Describe your image..."
                      className="min-h-24 resize-y font-mono"
                    />
                  </div>

                  {!hideControls && (
                    <div className="space-y-4">
                      {/* Model */}
                      <div className="space-y-1.5">
                        <Label className="text-xs font-mono tracking-wide text-muted-foreground">Model</Label>
                        <Select
                          value={params.model}
                          onValueChange={(v) => setParams((p) => ({ ...p, model: v }))}
                        >
                          <SelectTrigger className="h-10">
                            <SelectValue placeholder="Select model" />
                          </SelectTrigger>
                          <SelectContent>
                            {MODELS.map((m) => (
                              <SelectItem key={m} value={m}>
                                {m}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Aspect & Size */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label className="text-xs font-mono tracking-wide text-muted-foreground">Aspect</Label>
                          <div className="grid grid-cols-3 gap-2">
                            {(Object.keys(RATIOS) as RatioKey[]).map((k) => (
                              <button
                                key={k}
                                type="button"
                                onClick={() => {
                                  const base = params.width; // keep width, compute height
                                  const h = Math.max(64, Math.round(base / RATIOS[k]));
                                  setParams({ height: h });
                                }}
                                className={`h-9 rounded-md border text-xs font-mono transition-colors ${
                                  currentRatio === k
                                    ? "bg-foreground text-background border-foreground"
                                    : "hover:bg-accent border-muted"
                                }`}
                              >
                                {k}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-mono tracking-wide text-muted-foreground">Size</Label>
                          <div className="grid grid-cols-4 gap-2">
                            {(Object.keys(SIZES) as SizeKey[]).map((k) => (
                              <button
                                key={k}
                                type="button"
                                onClick={() => {
                                  const w = SIZES[k];
                                  const h = Math.max(64, Math.round(w / RATIOS[currentRatio]));
                                  setParams({ width: w, height: h });
                                }}
                                className="h-9 rounded-md border text-xs font-mono hover:bg-accent"
                              >
                                {k}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Dimensions & Seed */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs font-mono tracking-wide text-muted-foreground">Width</Label>
                          <Input
                            type="number"
                            min={64}
                            max={1536}
                            step={1}
                            value={params.width}
                            onChange={(e) => setParams((p) => ({ ...p, width: Number(e.target.value) }))}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs font-mono tracking-wide text-muted-foreground">Height</Label>
                          <Input
                            type="number"
                            min={64}
                            max={1536}
                            step={1}
                            value={params.height}
                            onChange={(e) => setParams((p) => ({ ...p, height: Number(e.target.value) }))}
                          />
                        </div>
                        <div className="space-y-1 col-span-2">
                          <Label className="text-xs font-mono tracking-wide text-muted-foreground">Seed</Label>
                          <Input
                            type="number"
                            placeholder="(optional)"
                            value={params.seed ?? ""}
                            onChange={(e) =>
                              setParams((p) => ({
                                ...p,
                                seed: e.target.value === "" ? null : Number(e.target.value),
                              }))
                            }
                          />
                        </div>
                      </div>

                      {/* Advanced toggles */}
                      {/** Toggle model flags without using any **/}
                      {/** These map to boolean fields on GenParams **/}
                      <div className="flex flex-wrap gap-2 pt-1">
                        {(["enhance", "safe", "private"] as const).map((flag) => (
                          <button
                            key={flag}
                            type="button"
                            onClick={() =>
                              setParams((prev) => ({
                                ...prev,
                                [flag]: !prev[flag],
                              }))
                            }
                            className={`rounded-full border px-3 py-1.5 text-xs font-mono capitalize transition-colors ${
                              params[flag]
                                ? "bg-foreground text-background border-foreground"
                                : "hover:bg-accent"
                            }`}
                          >
                            {flag}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="mt-4 flex flex-wrap gap-3">
                    <Button
                      disabled={loading || !params.prompt.trim()}
                      onClick={generate}
                      className="bg-white text-black hover:bg-gray-100"
                    >
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      <Wand2 className="mr-2 h-4 w-4" /> Generate
                    </Button>
                    <Button variant="outline" disabled={!imgUrl} onClick={generate} className="gap-1">
                      <RefreshCw className="h-4 w-4" /> Reroll
                    </Button>
                    <Button variant="secondary" disabled={!imgUrl} onClick={downloadImage} className="gap-1">
                      <Download className="h-4 w-4" /> Download
                    </Button>
                  </div>

                  {/* URL + errors */}
                  <div className="space-y-1 pt-2">
                    {requestedUrl && (
                      <div className="flex items-center gap-2 text-[11px] font-mono text-muted-foreground break-all">
                        <LinkIcon className="h-3.5 w-3.5" />
                        <span className="truncate">{requestedUrl}</span>
                      </div>
                    )}
                    {error && <div className="text-red-500 text-xs font-mono">{error}</div>}
                  </div>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Preview */}
        <section className="lg:col-span-7">
          <div className="relative aspect-video w-full overflow-hidden rounded-2xl border bg-gradient-to-b from-gray-950 to-gray-900">
            {!imgUrl && !loading && (
              <div className="absolute inset-0 grid place-items-center p-8 text-center">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground font-mono">
                    Enter a prompt and click Generate to create an image.
                  </p>
                </div>
              </div>
            )}
            {imgUrl && (
              <Image
                src={imgUrl}
                alt="Generated"
                fill
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-contain"
                loading="lazy"
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
              />
            )}
            {loading && (
              <div className="absolute inset-0 grid place-items-center bg-black/30 backdrop-blur-sm">
                <Loader2 className="h-8 w-8 animate-spin text-white" />
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
});

export default PollinationsImageGen;
