"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const RATIOS = [
  { id: "1:1", label: "1:1 (Square)" },
  { id: "16:9", label: "16:9 (Widescreen)" },
  { id: "4:3", label: "4:3 (Classic)" },
  { id: "3:2", label: "3:2" },
  { id: "2:3", label: "2:3 (Portrait)" },
  { id: "9:16", label: "9:16 (Vertical)" },
  { id: "21:9", label: "21:9 (Ultrawide)" },
];

const STYLES = [
  { id: "smart", label: "Smart" },
  { id: "minimalist", label: "Minimalist" },
  { id: "anime", label: "Anime" },
  { id: "cinematic", label: "Cinematic" },
  { id: "bokeh", label: "Bokeh" },
  { id: "manga", label: "Manga" },
  { id: "ghibli", label: "Ghibli" },
  { id: "sketch", label: "Sketch" },
  { id: "vector", label: "Vector" },
  { id: "illustration", label: "Illustration" },
];

type Mode = "txt2img" | "img2img" | "img2txt" | "inpaint";

function classNames(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

export default function ImageGenPage() {
  const [prompt, setPrompt] = useState("");
  const [mode, setMode] = useState<Mode>("txt2img");
  const [ratio, setRatio] = useState<string>("16:9");
  const [style, setStyle] = useState<string>("smart");
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [provider, setProvider] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [strength, setStrength] = useState<number>(0.35); // for img2img (lower = stronger edits)
  const [maskFile, setMaskFile] = useState<File | null>(null);
  const [maskPreview, setMaskPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState<string | null>(null); // for img2txt

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] || null;
    setFile(f);
    setCaption(null);
    if (f) {
      const reader = new FileReader();
      reader.onload = () => setFilePreview(String(reader.result));
      reader.readAsDataURL(f);
    } else {
      setFilePreview(null);
    }
  }

  function onMaskChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] || null;
    setMaskFile(f);
    if (f) {
      const reader = new FileReader();
      reader.onload = () => setMaskPreview(String(reader.result));
      reader.readAsDataURL(f);
    } else {
      setMaskPreview(null);
    }
  }

  async function generate() {
    setError(null);
    setImgUrl(null);
    setCaption(null);
    setProvider(null);
    if (mode === "txt2img" && !prompt.trim()) return;
    if ((mode === "img2img" || mode === "img2txt" || mode === "inpaint") && !file) {
      setError("Please upload an image first.");
      return;
    }
    if (mode === "inpaint" && !maskFile) {
      setError("Please upload a mask image.");
      return;
    }
    setLoading(true);
    try {
      let imageBase64: string | undefined;
      if (file) {
        imageBase64 = filePreview || undefined;
      }
      let maskBase64: string | undefined;
      if (maskFile) {
        maskBase64 = maskPreview || undefined;
      }
      const res = await fetch("/api/imagegen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, prompt, ratio, style, image: imageBase64, strength, mask: maskBase64, maskSource: "MASK_IMAGE_BLACK" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed");
      if (mode === "img2txt") {
        setCaption((data.caption as string) || null);
      } else {
        setImgUrl(data.url as string);
      }
      setProvider(data.provider || null);
    } catch (e: unknown) {
      const msg =
        e && typeof e === "object" && "message" in e && typeof (e as { message?: unknown }).message === "string"
          ? (e as { message: string }).message
          : String(e);
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-background" />
      <section className="container mx-auto px-4 sm:px-6 py-16 md:py-24">
        <GlowingEffect spread={60} glow className="rounded-2xl">
          <div className="rounded-2xl p-4 bg-transparent">
            <Card className="rounded-2xl border bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <CardHeader>
                <CardTitle>ImageGen</CardTitle>
                <CardDescription>
                  Text→Image.
                  <span className="ml-2 opacity-70">Powered by Hugging Face + Stability</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-24 md:pb-6">
                {/* Mode toggle */}
                <div className="inline-flex rounded-lg border bg-background p-1 text-xs mb-4 max-w-full overflow-x-auto whitespace-nowrap gap-1">
                    {([ 
                    { id: "txt2img", label: "Text → Image" },
                  ] as Array<{ id: Mode; label: string }>).map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMode(m.id)}
                      className={
                        classNames(
                          "px-3 py-1.5 rounded-md transition-colors",
                          mode === m.id ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                        )
                      }
                    >
                      {m.label}
                    </button>
                  ))}
                </div>

                {/* Inputs */}
                {mode !== "img2txt" && (
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Input
                      placeholder="e.g. Neon cyberpunk cityscape with bold title"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                    />
                    {mode !== "img2img" && (
                      <Select value={ratio} onValueChange={setRatio}>
                        <SelectTrigger className="min-w-[8rem] sm:w-[8rem] w-full"><SelectValue placeholder="Aspect" /></SelectTrigger>
                        <SelectContent>
                          {RATIOS.map(r => (
                            <SelectItem key={r.id} value={r.id}>{r.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    <Select value={style} onValueChange={setStyle}>
                      <SelectTrigger className="min-w-[9rem] sm:w-[9rem] w-full"><SelectValue placeholder="Style" /></SelectTrigger>
                      <SelectContent>
                        {STYLES.map(s => (
                          <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {mode !== "txt2img" && (
                  <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
                    <input type="file" accept="image/*" onChange={onFileChange} className="text-sm" />
                    {mode === "img2img" && (
                      <div className="flex items-center gap-2">
                        <label className="text-xs text-muted-foreground">Strength (lower = stronger change)</label>
                        <input
                          type="range"
                          min={0.2}
                          max={0.95}
                          step={0.01}
                          value={strength}
                          onChange={(e) => setStrength(parseFloat(e.target.value))}
                        />
                        <span className="text-xs w-10 text-right">{strength.toFixed(2)}</span>
                      </div>
                    )}
                    {mode === "inpaint" && (
                      <div className="flex items-center gap-2">
                        <label className="text-xs text-muted-foreground">Mask</label>
                        <input type="file" accept="image/*" onChange={onMaskChange} className="text-sm" />
                        <span className="text-xs text-muted-foreground">White = keep, Black = replace</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Desktop action */}
                <div className="mt-3 hidden md:block">
                  <Button onClick={generate} disabled={loading || (mode === "txt2img" && !prompt.trim())}>
                    {loading ? "Generating..." : mode === "img2txt" ? "Caption Image" : "Generate"}
                  </Button>
                </div>
                {error && <div className="mt-3 text-sm text-red-500">{error}</div>}
                {provider === "placeholder" && (
                  <div className="mt-3 text-xs text-muted-foreground">
                    Using placeholder preview. Set HF_TOKEN or STABILITY_API_KEY in your environment to enable real generation.
                  </div>
                )}
                {mode === "img2img" && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    For image-to-image, output size matches the uploaded image. Aspect ratio is ignored by the provider.
                  </div>
                )}
                {/* Previews */}
                <div className="mt-6 grid gap-6 md:grid-cols-2 items-start">
                  {filePreview && (
                    <div>
                      <div className="text-sm mb-2 text-muted-foreground">Input image</div>
                      <img src={filePreview} alt="Input" className="rounded-md border max-w-full w-full h-auto object-contain" />
                    </div>
                  )}
                  {maskPreview && (
                    <div>
                      <div className="text-sm mb-2 text-muted-foreground">Mask</div>
                      <img src={maskPreview} alt="Mask" className="rounded-md border max-w-full w-full h-auto object-contain" />
                    </div>
                  )}
                  {imgUrl && (
                    <div>
                      <div className="text-sm mb-2 text-muted-foreground">Result</div>
                      <img src={imgUrl} alt="Result" className="rounded-md border max-w-full w-full h-auto object-contain" />
                    </div>
                  )}
                </div>
                {caption && (
                  <div className="mt-6 text-sm whitespace-pre-wrap">
                    <span className="font-medium">Caption:</span> {caption}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </GlowingEffect>
      </section>
      {/* Mobile sticky action */}
      <div className="md:hidden fixed bottom-4 left-0 right-0 px-4">
        <div className="mx-auto max-w-screen-sm">
          <Button
            onClick={generate}
            disabled={loading || (mode === "txt2img" && !prompt.trim())}
            className="w-full rounded-full shadow-lg"
          >
            {loading ? "Generating..." : mode === "img2txt" ? "Caption Image" : "Generate"}
          </Button>
        </div>
      </div>
    </main>
  );
}
