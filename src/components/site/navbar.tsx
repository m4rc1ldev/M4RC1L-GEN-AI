"use client";
import Link from "next/link";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto h-14 px-4 flex items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">M</span>
          <span className="sr-only">M4RC1L</span>
        </Link>
        <nav className="hidden md:flex items-center gap-4 text-sm">
          <Link href="/M4RC1L" className="hover:underline">Chat</Link>
          <Link href="/imagegen" className="hover:underline">ImageGen</Link>
        </nav>
      </div>
    </header>
  );
}
