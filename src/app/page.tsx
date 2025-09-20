"use client";

import { Hero, Footer, LazyWrapper } from "@/components/common"; 
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { ChatPreview } from "@/components/sections/ChatPreview";
import { ContactSection } from "@/components/sections/ContactSection";
import Lenis from "lenis"
import dynamic from "next/dynamic";

// Lazy load heavy components
const ImageGenTrail = dynamic(() => import("@/components/sections/ImageGenTrail"), {
  ssr: false,
  loading: () => <div className="h-[200px] animate-pulse bg-muted/50 rounded-lg" />
});

export default function DemoOne() {

  useEffect(() => {
    const lenis = new Lenis();
    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }, []);


  const navigationLinks = [
    { name: 'HOME', href: '/' },
    { name: 'WORK', href: '/work' }, // placeholder retained
    { name: 'ABOUT', href: 'https://port-folio-ten-smoky.vercel.app/' },
    { name: 'CONTACT', href: 'https://linkedin.com/in/mayank-shukla-4a37b92ab/' }
    

  ];

  return (
   <main className="min-h-screen w-full relative overflow-x-hidden scrollbar-hide">
      <Hero 
        title="M4RC1L"
        description="An adaptive AI engine powers creative generation — images refine, text aligns, and realtime processing streams like thought. Models coordinate intelligently, revealing structured potential inside unstructured ideas."
        links={navigationLinks}
      />
      <LazyWrapper 
        fallback={<div className="h-[300px] animate-pulse bg-muted/20 rounded-lg mx-6" />}
        threshold={0.1}
        rootMargin="200px"
      >
        <ChatPreview />
      </LazyWrapper>
      <LazyWrapper 
        fallback={<div className="h-[400px] animate-pulse bg-muted/20 rounded-lg mx-6" />}
        threshold={0.1}
        rootMargin="200px"
      >
        <ImageGenTrail />
      </LazyWrapper>
      <LazyWrapper 
        fallback={<div className="h-[300px] animate-pulse bg-muted/20 rounded-lg mx-6" />}
        threshold={0.1}
        rootMargin="100px"
      >
        <ContactSection />
      </LazyWrapper>
      <Footer />
      {/* Floating Start Chat Button */}
      <div className="fixed bottom-4 hidden md:block right-4 z-50">
        <Button asChild size="lg" className="rounded-full px-6 py-5 text-sm tracking-wide shadow-lg bg-white text-black hover:text-white hover:border-white border font-mono font-light hover:bg-primary">
          <Link href="/chat">Start Chat</Link>
        </Button>
      </div>
   </main>
  );
}
