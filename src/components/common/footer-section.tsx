'use client';
import React from 'react';
import type { ComponentProps, ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Github, Linkedin, Instagram, ExternalLink, Command, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface FooterLink {
  title: string;
  href: string;
  external?: boolean;
}

interface FooterSectionConfig {
  label: string;
  links: FooterLink[];
}

// Updated navigation sections to better align with the project's AI generation vibe
const navSections: FooterSectionConfig[] = [
  {
    label: 'Generate',
    links: [
      { title: 'Image', href: '/imagegen' },
      { title: 'Video', href: '/videogen' },
      { title: 'Thumbnail', href: '/thumbgen' },
      { title: 'Chat', href: '/#chat' },
    ],
  },
  {
    label: 'Platform',
    links: [
      { title: 'Models', href: '/api/models' },
      { title: 'API Proxy', href: '/api/mcp/proxy' },
      { title: 'Status', href: '/status' },
      { title: 'Changelog', href: '/changelog' },
    ],
  },
  {
    label: 'Resources',
    links: [
      { title: 'Docs', href: '/docs' },
      { title: 'Blog', href: '/blog' },
      { title: 'Privacy', href: '/privacy' },
      { title: 'Terms', href: '/terms' },
    ],
  },
];

const socials = [
  {
    label: 'GitHub',
    href: 'https://github.com/m4rc1ldev',
    icon: Github,
  },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/mayank-shukla-4a37b92ab/',
    icon: Linkedin,
  },
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/m4rc1l.exe/',
    icon: Instagram,
  },
];

export function Footer() {
  return (
    <footer
      className="relative w-full mx-auto flex flex-col justify-between overflow-hidden border-t border-white/10 bg-black/95 backdrop-blur supports-[backdrop-filter]:bg-black/80 px-6 py-14 md:py-16 lg:py-20 min-h-[420px] md:rounded-t-[3rem]"
    >
      {/* top accent glow & subtle grid */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.08] [background:radial-gradient(circle_at_50%_-10%,theme(colors.primary/40),transparent_70%),repeating-linear-gradient(0deg,transparent_0,transparent_22px,rgba(255,255,255,0.03)_22px,rgba(255,255,255,0.03)_23px)]" />
      <div className="absolute top-0 left-1/2 h-px w-1/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-white/40 to-transparent" />

      <div className="relative z-10 grid w-full gap-12 xl:grid-cols-4">
        {/* Brand / mission */}
        <AnimatedContainer className="flex flex-col gap-5">
          <div className="flex items-center gap-3">
            <div className="relative h-11 w-11 flex items-center justify-center rounded-xl bg-gradient-to-br from-primary/40 via-primary/10 to-background border border-white/10 shadow-inner overflow-hidden">
              <Command className="h-5 w-5 opacity-90" />
              <Sparkles className="absolute -bottom-1 -right-1 h-4 w-4 text-primary/60" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-mono text-lg tracking-tight">M4RC1L</span>
              <span className="text-[10px] tracking-[0.2em] text-muted-foreground uppercase">Gen • AI • Stack</span>
            </div>
          </div>
          <p className="text-xs md:text-sm text-muted-foreground max-w-xs leading-relaxed font-mono">
            Building adaptive creative tooling for images, video & conversational intelligence. Ship faster with aesthetic precision.
          </p>
          <div className="flex gap-3 pt-2">
            {socials.map((s) => {
              const Icon = s.icon;
              return (
                <Link
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="group relative h-9 w-9 flex items-center justify-center rounded-lg border border-white/10 bg-white/5 hover:border-primary/50 hover:bg-primary/10 transition-colors"
                >
                  <Icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </Link>
              );
            })}
          </div>
        </AnimatedContainer>

        {/* Navigation sections */}
        <div className="xl:col-span-3 grid grid-cols-2 md:grid-cols-3 gap-10 md:gap-12">
          {navSections.map((section, i) => (
            <AnimatedContainer delay={0.1 + i * 0.1} key={section.label} className="space-y-4">
              <h3 className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
                {section.label}
              </h3>
              <ul className="space-y-2.5 font-mono text-[13px]">
                {section.links.map((l) => (
                  <li key={l.title}>
                    <Link
                      href={l.href}
                      className="group inline-flex items-center gap-1.5 text-muted-foreground/80 hover:text-primary transition-colors"
                    >
                      <span>{l.title}</span>
                      {l.external && (
                        <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 -translate-y-[1px] transition-opacity" />
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </AnimatedContainer>
          ))}
        </div>
      </div>

      {/* bottom bar */}
      <div className="relative z-10 mt-14 flex flex-col gap-6 md:flex-row md:items-center md:justify-between text-[11px] md:text-xs font-mono text-muted-foreground/70">
        <div className="flex items-center gap-2">
          <span className="tracking-tight">© {new Date().getFullYear()} M4RC1L • All rights reserved</span>
        </div>
        <div className="flex flex-wrap items-center gap-4 md:gap-6">
          <span className="inline-flex items-center gap-1"><span className="h-1 w-1 rounded-full bg-primary/60" />Next.js</span>
          <span className="inline-flex items-center gap-1"><span className="h-1 w-1 rounded-full bg-primary/60" />TypeScript</span>
          <span className="inline-flex items-center gap-1"><span className="h-1 w-1 rounded-full bg-primary/60" />Edge AI</span>
          <span className="inline-flex items-center gap-1"><span className="h-1 w-1 rounded-full bg-primary/60" />Design System</span>
        </div>
      </div>

      {/* gradient orbs */}
      <div className="pointer-events-none absolute -bottom-24 left-0 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute -top-24 right-0 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
    </footer>
  );
};

// Animation wrapper (unchanged logic)
type ViewAnimationProps = {
  delay?: number;
  className?: ComponentProps<typeof motion.div>['className'];
  children: ReactNode;
};

function AnimatedContainer({ className, delay = 0.1, children }: ViewAnimationProps) {
  const shouldReduceMotion = useReducedMotion();
  if (shouldReduceMotion) {
    return <>{children}</>;
  }
  return (
    <motion.div
      initial={{ filter: 'blur(4px)', translateY: -8, opacity: 0 }}
      whileInView={{ filter: 'blur(0px)', translateY: 0, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.8 }}
      className={className}
    >
      {children}
    </motion.div>
  );
};