import { Github, Linkedin, Instagram, Mail, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

// Tailwind + shadcn-styled contact section with social links
// Uses provided profiles. Add an email or form later if desired.
export function ContactSection() {
  const socials = [
    {
      name: "GitHub",
      href: "https://github.com/m4rc1ldev/",
      icon: Github,
      handle: "@m4rc1ldev",
      accent: "from-[#0f0f0f] to-[#2d2d2d]",
    },
    {
      name: "LinkedIn",
      href: "https://www.linkedin.com/in/mayank-shukla-4a37b92ab/",
      icon: Linkedin,
      handle: "Mayank Shukla",
      accent: "from-[#0A66C2] to-[#004182]",
    },
    {
      name: "Instagram",
      href: "https://www.instagram.com/m4rc1l.exe/",
      icon: Instagram,
      handle: "@m4rc1l.exe",
      accent: "from-[#fd1d1d] via-[#fcb045] to-[#833ab4]",
      multi: true,
    },
  ];

  return (
    <section
      id="contact"
      className="relative w-full py-20 md:py-28 overflow-hidden"
    >
      {/* subtle background grid / noise overlay (optional) */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.15] mix-blend-overlay [mask-image:radial-gradient(circle_at_center,black,transparent)]" />

      <div className="container mx-auto max-w-5xl px-4 md:px-6 relative">
        <div className="flex flex-col items-start gap-6 md:gap-8">
          <div className="space-y-4 max-w-2xl">
            <h2 className="text-3xl md:text-5xl font-mono tracking-tight font-light">
              Let's Connect
            </h2>
            <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
              Building adaptive interfaces & AI-powered experiences. Reach out if
              you want to collaborate, have an opportunity, or just vibe about
              creative engineering.
            </p>
          </div>

          <div className="grid w-full gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {socials.map((s) => {
              const Icon = s.icon;
              return (
                <Link
                  key={s.name}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative rounded-xl border bg-gradient-to-br from-background/60 to-background/20 backdrop-blur-sm p-4 md:p-5 flex flex-col gap-4 overflow-hidden hover:shadow-md transition-all"
                >
                  {/* gradient accent */}
                  <div
                    className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r ${
                      s.multi ? "" : s.accent
                    } ${
                      s.multi
                        ? "from-[#fd1d1d] via-[#fcb045] to-[#833ab4]"
                        : ""
                    } blur-xl -z-10`}
                  />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="relative flex h-10 w-10 items-center justify-center rounded-lg border bg-background/50 backdrop-blur-sm">
                        <Icon className="h-5 w-5" />
                      </span>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium tracking-wide uppercase text-muted-foreground/70">
                          {s.name}
                        </span>
                        <span className="font-mono text-base md:text-lg">
                          {s.handle}
                        </span>
                      </div>
                    </div>
                    <ArrowUpRight className="h-5 w-5 opacity-40 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                  </div>
                  <div className="pt-1 text-xs text-muted-foreground/70 font-mono flex items-center gap-1">
                    Open profile
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="w-full pt-4 md:pt-8 flex flex-col md:flex-row gap-6 items-start md:items-center">
            <div className="text-xs md:text-sm font-mono text-muted-foreground/70">
              Prefer email?{" "}
              <a
                href="mailto:contact@m4rc1l.dev"
                className="underline decoration-dashed underline-offset-4 hover:text-primary transition-colors"
              >
                contact@m4rc1l.dev
              </a>
            </div>
            <div className="flex items-center gap-3 text-[10px] md:text-xs text-muted-foreground uppercase tracking-wider">
              <span className="h-px w-10 bg-gradient-to-r from-transparent via-border to-transparent" />
              <span>Crafted with Next.js & AI tooling</span>
              <span className="h-px w-10 bg-gradient-to-r from-transparent via-border to-transparent" />
            </div>
          </div>
        </div>
      </div>

      {/* decorative corner orbits */}
      <div className="pointer-events-none absolute -top-10 -right-10 h-56 w-56 rounded-full bg-gradient-to-tr from-primary/30 to-primary/0 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-10 -left-10 h-56 w-56 rounded-full bg-gradient-to-tr from-primary/30 to-primary/0 blur-3xl" />
    </section>
  );
}