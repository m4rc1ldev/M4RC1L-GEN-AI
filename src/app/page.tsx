import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, ImageIcon } from "lucide-react";
import { FlipWords } from "@/components/ui/flip-words";
import { BackgroundRippleEffect } from "@/components/ui/background-ripple-effect";
import { EvervaultCard } from "@/components/ui/evervault-card";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import AppNavbar from "@/components/site/app-navbar";
import { BackgroundBeamsWithCollision } from "@/components/ui/background-beams-with-collision";
import ShareSection from "@/components/site/share-section";
import SiteFooter from "@/components/site/footer";


export default function HomePage() {
  return (
    <main className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-background" />
  <BackgroundRippleEffect className="-z-10" height="85vh" />
      <AppNavbar />

  <section className="container mx-auto px-4 sm:px-6 py-16 sm:py-24 md:py-44 text-center relative">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <BackgroundBeamsWithCollision className="opacity-80">
            <div></div>
          </BackgroundBeamsWithCollision>
        </div>
  <h1 className="flex items-center justify-center px-2">
       <Link
         href="https://m4rc1l.dev"
         aria-label="M4RC1L"
         className="font-brightwall text-shadow p-5 text-5xl sm:text-6xl md:text-7xl lg:text-8xl leading-none text-foreground"
       >
         M4RC1L
       </Link>
     </h1>





  <div className="mt-5 sm:mt-6 text-lg sm:text-xl md:text-2xl lg:text-4xl text-zinc-600 dark:text-zinc-300 max-w-4xl mx-auto px-2">
          Build <span className="font-semibold text-foreground"><FlipWords words={["better", "modern", "quick", "easily"]} /></span> anything with M4RC1L.
        </div>
  <div className="mt-8 sm:mt-10 md:mt-12 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          <Link href="/M4RC1L" className="px-4 py-2 rounded-md border border-black bg-white text-black text-sm hover:shadow-[4px_4px_0px_0px_rgba(0,0,0)] transition duration-200">
            Try M4RC1L <ArrowRight className="ml-2 inline-block h-4 w-4 align-[-2px]" />
          </Link>
          <Link href="/imagegen" className="px-4 py-2 rounded-md border border-black bg-white text-black text-sm hover:shadow-[4px_4px_0px_0px_rgba(0,0,0)] transition duration-200">
            Open ImageGen <ImageIcon className="ml-2 inline-block h-4 w-4 align-[-2px]" />
          </Link>
        </div>
      </section>

      <section className="container mx-auto px-6 pb-20">
        <h2 className="mb-8 text-2xl md:text-3xl font-semibold tracking-tight">Our products</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <GlowingEffect spread={60} glow={true} className="rounded-2xl">
            <div className="rounded-2xl p-4 bg-transparent">
              <EvervaultCard text="Chat" className="aspect-[4/3]" />
              <div className="mt-4">
                <p className="text-sm text-muted-foreground mb-3">Streamed responses, image URL preview, quick prompts.</p>
                <Button asChild className="w-full"><Link href="/M4RC1L">Launch Chat</Link></Button>
              </div>
            </div>
          </GlowingEffect>

          <GlowingEffect spread={60} glow={true} className="rounded-2xl">
            <div className="rounded-2xl p-4 bg-transparent">
              <EvervaultCard text="ImageGen" className="aspect-[4/3]" />
              <div className="mt-4">
                <p className="text-sm text-muted-foreground mb-3">Generate images with ratio and style controls.</p>
                <Button asChild className="w-full" variant="secondary"><Link href="/imagegen">Create Image</Link></Button>
              </div>
            </div>
          </GlowingEffect>

          <GlowingEffect spread={60} glow={true} className="rounded-2xl">
            <div className="rounded-2xl p-4 bg-transparent">
              <EvervaultCard text="Explore" className="aspect-[4/3]" />
              <div className="mt-4 flex gap-2">
                <Button asChild variant="outline"><Link href="/M4RC1L">Chat presets</Link></Button>
                <Button asChild variant="outline"><Link href="/imagegen">Image presets</Link></Button>
              </div>
            </div>
          </GlowingEffect>
        </div>
      </section>
  <ShareSection />
  <SiteFooter />
    </main>
  );
}
