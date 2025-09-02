"use client";
import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

type SparklesProps = {
  className?: string;
  background?: string;
  particleColor?: string;
  minSize?: number;
  maxSize?: number;
  particleDensity?: number; // approximate count per 1000x1000 area
};

export function SparklesCore({
  className,
  background = "transparent",
  particleColor = "#FFFFFF",
  minSize = 0.6,
  maxSize = 1.2,
  particleDensity = 800,
}: SparklesProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
  const maybe = canvas.getContext("2d", { alpha: true });
  if (!maybe) return;
  const ctx = maybe as CanvasRenderingContext2D;

  const dpr = Math.max(1, window.devicePixelRatio || 1);
    let width = 0;
    let height = 0;

    function resize() {
      const parent = canvas.parentElement as HTMLElement;
      width = parent.clientWidth;
      height = parent.clientHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      initParticles();
    }

    type P = { x: number; y: number; r: number; vx: number; vy: number; a: number };
    let particles: P[] = [];

    function initParticles() {
      const area = Math.max(1, (width * height) / 1_000_000); // scale count by area (per 1000x1000)
      const count = Math.floor(particleDensity * area);
      particles = Array.from({ length: count }).map(() => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: minSize + Math.random() * (maxSize - minSize),
        vx: (Math.random() - 0.5) * 0.05,
        vy: Math.random() * 0.08 + 0.02,
        a: Math.random() * 0.6 + 0.4,
      }));
    }

    function step() {
      // background clear
      if (background !== "transparent") {
        ctx.fillStyle = background as string;
        ctx.fillRect(0, 0, width, height);
      } else {
        ctx.clearRect(0, 0, width, height);
      }

  ctx.fillStyle = particleColor as string;
      for (const p of particles) {
        ctx.globalAlpha = p.a;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();

        // update
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -2) p.x = width + 2;
        if (p.x > width + 2) p.x = -2;
        if (p.y > height + 2) {
          p.y = -2;
          p.x = Math.random() * width;
        }
      }
      ctx.globalAlpha = 1;

      rafRef.current = requestAnimationFrame(step);
    }

    resize();
    window.addEventListener("resize", resize);
    rafRef.current = requestAnimationFrame(step);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [background, maxSize, minSize, particleColor, particleDensity]);

  return <canvas ref={canvasRef} className={cn("block w-full h-full", className)} />;
}

export default SparklesCore;
