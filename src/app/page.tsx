"use client";

import { Hero, Footer } from "@/components/common"; 
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ChatPreview } from "@/components/sections/ChatPreview";
import ImageGenTrail from "@/components/sections/ImageGenTrail";
import Lenis from "lenis"
import { ContactSection } from "@/components/sections/ContactSection";


export default function DemoOne() {

  useEffect(() => {
    const lenis = new Lenis();
    function raf(time: any) {
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
const [value, setValue] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = () => {
		setIsLoading(true);
		setTimeout(() => {
			toast(value);
			setIsLoading(false);
		}, 1000);
	};
  return (
   <main className="min-h-screen w-full relative overflow-x-hidden scrollbar-hide">
      <Hero 
        title="M4RC1L"
        description="An adaptive AI engine powers creative generation — images refine, text aligns, and realtime processing streams like thought. Models coordinate intelligently, revealing structured potential inside unstructured ideas."
        links={navigationLinks}
      />
      <ChatPreview />
      <ImageGenTrail />
      <ContactSection />
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
