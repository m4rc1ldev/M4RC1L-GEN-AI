import { NextResponse } from "next/server";
import sharp from "sharp";

type Ratio = "1:1" | "16:9" | "4:3" | "3:2" | "2:3" | "9:16" | "21:9";

function ratioToSize(ratio: Ratio): { width: number; height: number } {
  // Base sizes before clamping
  let width = 1280, height = 720; // 16:9 default
  switch (ratio) {
    case "1:1":
      width = 1024; height = 1024; break;
    case "4:3":
      width = 1280; height = 960; break;
    case "3:2":
      width = 1200; height = 800; break;
    case "2:3":
      width = 800; height = 1200; break;
    case "9:16":
      width = 720; height = 1280; break;
    case "21:9":
      width = 1680; height = 720; break;
    case "16:9":
    default:
      width = 1280; height = 720; break;
  }
  // Clamp the longer side to 1024 to save credits; keep multiples of 64
  const maxSide = Math.max(width, height);
  const scale = maxSide > 1024 ? 1024 / maxSide : 1;
  let w = Math.round((width * scale) / 64) * 64;
  let h = Math.round((height * scale) / 64) * 64;
  w = Math.max(64, w); h = Math.max(64, h);
  return { width: w, height: h };
}

function styleToPrompt(style: string): string {
  const s = style.toLowerCase();
  const map: Record<string, string> = {
    smart: "high quality, detailed, photorealistic",
    minimalist: "minimalist, clean, simple, flat design",
    anime: "anime style, vibrant colors, cel shading",
    cinematic: "cinematic lighting, dramatic, film still",
    bokeh: "shallow depth of field, bokeh background",
    manga: "black and white manga style, screentone, ink",
    ghibli: "Studio Ghibli style, whimsical, soft colors",
    sketch: "pencil sketch, line art, rough shading",
    vector: "vector illustration, flat colors, clean lines",
    illustration: "digital illustration, detailed, clean",
  };
  return map[s] ?? "high quality, detailed";
}

function dataUrlToBytes(dataUrl?: string): Uint8Array | null {
  if (!dataUrl) return null;
  const m = dataUrl.match(/^data:(.*?);base64,(.*)$/);
  if (!m) return null;
  return Uint8Array.from(Buffer.from(m[2], "base64"));
}

async function generateTxt2Img(prompt: string, ratio: Ratio, style: string) {
  const hfKey = process.env.HF_TOKEN;
  const stabilityKey = process.env.STABILITY_API_KEY;
  const styledPrompt = `${prompt}. Style: ${styleToPrompt(style)}`;
  const { width, height } = ratioToSize(ratio);

  if (hfKey) {
    try {
      const resp = await fetch("https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${hfKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs: styledPrompt, parameters: { width, height } }),
      });

      if (!resp.ok) {
        if (resp.status === 503) {
          await new Promise((r) => setTimeout(r, 5000));
          return generateTxt2Img(prompt, ratio, style);
        }
        const errText = await resp.text().catch(() => "");
        throw new Error(`Image provider error (${resp.status}): ${errText || resp.statusText}`);
      }

      const buffer = await resp.arrayBuffer();
      const base64 = Buffer.from(buffer).toString("base64");
      const url = `data:image/png;base64,${base64}`;
      return { url, provider: "huggingface" as const };
    } catch (err) {
      console.error(err);
      // fall through to stability/placeholder
    }
  }

  if (stabilityKey) {
    const model = process.env.STABILITY_MODEL || "sd3.5-large";
    const endpoints = [
      "https://api.stability.ai/v2beta/stable-image/generate/sd3",
      "https://api.stability.ai/v2beta/stable-image/generate/ultra",
    ];

    async function tryEndpoint(url: string, withModel: boolean) {
      const form = new FormData();
      if (withModel) form.append("model", model);
      form.append("prompt", styledPrompt);
      form.append("aspect_ratio", ratio as string);
      form.append("output_format", "png");
      const r = await fetch(url, {
        method: "POST",
        headers: { Authorization: `Bearer ${stabilityKey}`, Accept: "image/*" },
        body: form as unknown as BodyInit,
      });
      return r;
    }

    let resp = await tryEndpoint(endpoints[0], true);
    if (resp.status === 404) resp = await tryEndpoint(endpoints[0], false);
    if (resp.status === 404) resp = await tryEndpoint(endpoints[1], false);
    if (!resp.ok) {
      const errText = await resp.text().catch(() => "");
      throw new Error(`Image provider error (${resp.status}): ${errText || resp.statusText}`);
    }
    const buffer = await resp.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    const url = `data:image/png;base64,${base64}`;
    return { url, provider: "stability" as const };
  }

  const text = `${prompt} (${ratio}, ${style})`;
  const encoded = encodeURIComponent(text.slice(0, 60));
  const url = `https://dummyimage.com/${width}x${height}/111827/ffffff&text=${encoded}`;
  return { url, provider: "placeholder" as const };
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
  mode?: "txt2img" | "img2img" | "img2txt" | "inpaint";
      prompt?: string;
      ratio?: Ratio;
      style?: string;
      image?: string; // data URL
      strength?: number;
  mask?: string; // data URL for inpainting
  maskSource?: "MASK_IMAGE_BLACK" | "MASK_IMAGE_WHITE";
    };
    const mode = body.mode || "txt2img";
    const ratio = (body.ratio as Ratio) || "16:9";
    const style = body.style || "smart";
    const prompt = (body.prompt || "").trim();

    if (mode === "txt2img") {
      if (!prompt) return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
      const { url, provider } = await generateTxt2Img(prompt, ratio, style);
      return NextResponse.json({ url, provider });
    }

    if (mode === "img2img") {
      const stabilityKey = process.env.STABILITY_API_KEY;
      if (!stabilityKey) return NextResponse.json({ error: "STABILITY_API_KEY required for img2img" }, { status: 400 });
      const bytes = dataUrlToBytes(body.image);
      if (!bytes) return NextResponse.json({ error: "Invalid or missing image" }, { status: 400 });
      const styledPrompt = `${prompt || ""}. Style: ${styleToPrompt(style)}`.trim();
  // Lower default strength so changes are more visible (0.35 ≈ stronger edits)
  const strength = typeof body.strength === "number" ? Math.min(0.95, Math.max(0.2, body.strength)) : 0.35;

      // SDXL v1 requires init_image dimensions to be one of these pairs
      const allowed: Array<[number, number]> = [
        [1024, 1024],
        [1152, 896],
        [1216, 832],
        [1344, 768],
        [1536, 640],
        [640, 1536],
        [768, 1344],
        [832, 1216],
        [896, 1152],
      ];

      function closestPair(w: number, h: number): [number, number] {
        const aspect = w / h;
        let best: [number, number] = allowed[0];
        let bestDiff = Number.POSITIVE_INFINITY;
        for (const [aw, ah] of allowed) {
          const diff = Math.abs(aw / ah - aspect);
          // Prefer same orientation when diffs are very close
          const orientationPenalty = (w >= h) === (aw >= ah) ? 0 : 0.05;
          const score = diff + orientationPenalty;
          if (score < bestDiff) {
            bestDiff = score;
            best = [aw, ah];
          }
        }
        return best;
      }

      // Read original size and resize to the closest allowed pair if needed
      const inputBuffer = Buffer.from(bytes);
      const meta = await sharp(inputBuffer).metadata();
      const inW = meta.width ?? 0;
      const inH = meta.height ?? 0;
      const [tW, tH] = inW && inH ? closestPair(inW, inH) : [1024, 1024];
      const needsResize = !(inW === tW && inH === tH);
      const resizedBuffer = needsResize
        ? await sharp(inputBuffer).resize(tW, tH, { fit: "cover" }).png().toBuffer()
        : inputBuffer;

  const ab = resizedBuffer.buffer.slice(resizedBuffer.byteOffset, resizedBuffer.byteOffset + resizedBuffer.byteLength) as ArrayBuffer;
  const model = process.env.STABILITY_MODEL || "sd3.5-large";

  async function tryEdit(url: string, withModel: boolean) {
    const form = new FormData();
    form.append("image", new Blob([ab], { type: "image/png" }), "image.png");
    form.append("prompt", styledPrompt || "");
    form.append("strength", String(strength));
    form.append("output_format", "png");
    if (withModel) form.append("model", model);
    const r = await fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${stabilityKey}`, Accept: "image/*" },
      body: form as unknown as BodyInit,
    });
    return r;
  }

  const editEndpoints = [
    "https://api.stability.ai/v2beta/stable-image/edit/sd3",
    "https://api.stability.ai/v2beta/stable-image/edit/ultra",
  ];
  let resp = await tryEdit(editEndpoints[0], true);
  if (resp.status === 404) resp = await tryEdit(editEndpoints[0], false);
  if (resp.status === 404) resp = await tryEdit(editEndpoints[1], false);
      if (!resp.ok) {
        const errText = await resp.text().catch(() => "");
        throw new Error(`Image provider error (${resp.status}): ${errText || resp.statusText}`);
      }
  const arr = await resp.arrayBuffer();
  const base64 = Buffer.from(arr).toString("base64");
      const url = `data:image/png;base64,${base64}`;
      return NextResponse.json({ url, provider: "stability" as const });
    }

    if (mode === "inpaint") {
      const stabilityKey = process.env.STABILITY_API_KEY;
      if (!stabilityKey) return NextResponse.json({ error: "STABILITY_API_KEY required for inpainting" }, { status: 400 });
      const imgBytes = dataUrlToBytes(body.image);
      const maskBytes = dataUrlToBytes(body.mask);
      if (!imgBytes) return NextResponse.json({ error: "Invalid or missing base image" }, { status: 400 });
      if (!maskBytes) return NextResponse.json({ error: "Invalid or missing mask image" }, { status: 400 });
      const styledPrompt = `${prompt || ""}. Style: ${styleToPrompt(style)}`.trim();

      // Resize both to a valid SDXL v1 size
      const allowed: Array<[number, number]> = [
        [1024, 1024],
        [1152, 896],
        [1216, 832],
        [1344, 768],
        [1536, 640],
        [640, 1536],
        [768, 1344],
        [832, 1216],
        [896, 1152],
      ];
      function closestPair(w: number, h: number): [number, number] {
        const aspect = w / h;
        let best: [number, number] = allowed[0];
        let bestDiff = Number.POSITIVE_INFINITY;
        for (const [aw, ah] of allowed) {
          const diff = Math.abs(aw / ah - aspect);
          const orientationPenalty = (w >= h) === (aw >= ah) ? 0 : 0.05;
          const score = diff + orientationPenalty;
          if (score < bestDiff) { bestDiff = score; best = [aw, ah]; }
        }
        return best;
      }

      const inputBuffer = Buffer.from(imgBytes);
      const meta = await sharp(inputBuffer).metadata();
      const inW = meta.width ?? 0;
      const inH = meta.height ?? 0;
      const [tW, tH] = inW && inH ? closestPair(inW, inH) : [1024, 1024];
      const baseResized = await sharp(inputBuffer).resize(tW, tH, { fit: "cover" }).png().toBuffer();
      const maskResized = await sharp(Buffer.from(maskBytes)).resize(tW, tH, { fit: "cover" }).png().toBuffer();

      const baseAb = baseResized.buffer.slice(baseResized.byteOffset, baseResized.byteOffset + baseResized.byteLength) as ArrayBuffer;
      const maskAb = maskResized.buffer.slice(maskResized.byteOffset, maskResized.byteOffset + maskResized.byteLength) as ArrayBuffer;

      async function tryInpaint(url: string, withModel: boolean) {
        const form = new FormData();
        form.append("image", new Blob([baseAb], { type: "image/png" }), "image.png");
        form.append("mask", new Blob([maskAb], { type: "image/png" }), "mask.png");
        form.append("prompt", styledPrompt || "");
        form.append("output_format", "png");
        if (withModel) form.append("model", process.env.STABILITY_MODEL || "sd3.5-large");
        const r = await fetch(url, {
          method: "POST",
          headers: { Authorization: `Bearer ${stabilityKey}`, Accept: "image/*" },
          body: form as unknown as BodyInit,
        });
        return r;
      }

      const inpaintEndpoints = [
        "https://api.stability.ai/v2beta/stable-image/edit/inpaint",
        "https://api.stability.ai/v2beta/stable-image/edit/ultra",
      ];
      let resp = await tryInpaint(inpaintEndpoints[0], true);
      if (resp.status === 404) resp = await tryInpaint(inpaintEndpoints[0], false);
      if (resp.status === 404) resp = await tryInpaint(inpaintEndpoints[1], false);
      if (!resp.ok) {
        const errText = await resp.text().catch(() => "");
        throw new Error(`Image provider error (${resp.status}): ${errText || resp.statusText}`);
      }
  const arr = await resp.arrayBuffer();
  const base64 = Buffer.from(arr).toString("base64");
      const url = `data:image/png;base64,${base64}`;
      return NextResponse.json({ url, provider: "stability" as const });
    }

    if (mode === "img2txt") {
      const hfKey = process.env.HF_TOKEN;
      if (!hfKey) return NextResponse.json({ error: "HF_TOKEN required for image captioning" }, { status: 400 });
      const bytes = dataUrlToBytes(body.image);
      if (!bytes) return NextResponse.json({ error: "Invalid or missing image" }, { status: 400 });

      const resp = await fetch("https://api-inference.huggingface.co/models/Salesforce/blip-image-captioning-base", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${hfKey}`,
          "Content-Type": "application/octet-stream",
        },
        body: Buffer.from(bytes),
      });
      if (!resp.ok) {
        if (resp.status === 503) {
          await new Promise((r) => setTimeout(r, 5000));
          return POST(req);
        }
        const errText = await resp.text().catch(() => "");
        throw new Error(`Caption provider error (${resp.status}): ${errText || resp.statusText}`);
      }
      const out = (await resp.json()) as Array<{ generated_text?: string }>;
      const caption = out?.[0]?.generated_text || "";
      return NextResponse.json({ caption, provider: "huggingface" as const });
    }

    return NextResponse.json({ error: "Unsupported mode" }, { status: 400 });
  } catch (err: unknown) {
    const message =
      err && typeof err === "object" && "message" in err && typeof (err as { message?: unknown }).message === "string"
        ? (err as { message: string }).message
        : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
