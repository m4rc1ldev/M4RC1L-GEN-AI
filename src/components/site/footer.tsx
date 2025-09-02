import Link from "next/link";
import { SparklesCore } from "@/components/ui/sparkles";

export default function SiteFooter() {
  return (
    <div className="mt-24">
      {/* Brand band above the footer */}
      <div className="bg-black">
        <div className="container mx-auto px-6 py-14 md:py-16 flex flex-col items-center justify-center">
         
          <h2 className="select-none text-l font-black tracking-tight text-white/70 relative z-10">
            Do more with M4RC1L.
          </h2>
          <div className="relative w-[40rem] max-w-full h-28 mt-2">
            {/* Gradient lines */}
            <div className="absolute inset-x-20 top-0 bg-gradient-to-r from-transparent via-indigo-500 to-transparent h-[2px] w-3/4 blur-sm" />
            <div className="absolute inset-x-20 top-0 bg-gradient-to-r from-transparent via-indigo-500 to-transparent h-px w-3/4" />
            <div className="absolute inset-x-60 top-0 bg-gradient-to-r from-transparent via-sky-500 to-transparent h-[5px] w-1/4 blur-sm" />
            <div className="absolute inset-x-60 top-0 bg-gradient-to-r from-transparent via-sky-500 to-transparent h-px w-1/4" />
            {/* Sparkles background */}
            <SparklesCore
              background="transparent"
              minSize={0.4}
              maxSize={1}
              particleDensity={1200}
              className="w-full h-full"
              particleColor="#FFFFFF"
            />
            {/* Radial gradient mask to fade edges */}
            <div className="absolute inset-0 w-full h-full bg-black [mask-image:radial-gradient(350px_140px_at_top,transparent_20%,white)]" />
          </div>
        </div>
      </div>

      {/* Footer proper */}
      <footer className="border-t border-zinc-900 bg-black text-zinc-300">
        <div className="container mx-auto max-w-5xl px-6 py-28 min-h-[320px]">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4 md:gap-10 justify-items-start">
            {/* Column: Try on */}
            <div>
              <h3 className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Try M4RC1L on</h3>
              <ul className="mt-4 space-y-3 text-sm">
                <li><Link className="hover:text-white" href="/M4RC1L">Web</Link></li>
                <li><span className="text-zinc-500">iOS</span></li>
                <li><span className="text-zinc-500">Android</span></li>
                <li><Link className="hover:text-white" href="https://x.com">M4RC1L on X</Link></li>
              </ul>
            </div>

            {/* Column: Products */}
            <div>
              <h3 className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Products</h3>
              <ul className="mt-4 space-y-3 text-sm">
                <li><Link className="hover:text-white" href="/M4RC1L">M4RC1L</Link></li>
                <li><Link className="hover:text-white" href="/M4RC1L#api">API</Link></li>
              </ul>
            </div>

            {/* Column: Company */}
            <div>
              <h3 className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Company</h3>
              <ul className="mt-4 space-y-3 text-sm">
                <li><Link className="hover:text-white" href="/company">Company</Link></li>
                <li><Link className="hover:text-white" href="/careers">Careers</Link></li>
                <li><Link className="hover:text-white" href="/contact">Contact</Link></li>
                <li><Link className="hover:text-white" href="/news">News</Link></li>
              </ul>
            </div>

            {/* Column: Resources */}
            <div>
              <h3 className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Resources</h3>
              <ul className="mt-4 space-y-3 text-sm">
                <li><Link className="hover:text-white" href="/docs">Documentation</Link></li>
                <li><Link className="hover:text-white" href="/privacy">Privacy policy</Link></li>
                <li><Link className="hover:text-white" href="/security">Security</Link></li>
                <li><Link className="hover:text-white" href="/safety">Safety</Link></li>
                <li><Link className="hover:text-white" href="/legal">Legal</Link></li>
                <li><Link className="hover:text-white" href="/status">Status</Link></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-zinc-800 py-8 text-center text-xs text-zinc-500">
          © {new Date().getFullYear()}, M4RC1L · Privacy policy · Terms of service · Contact information
        </div>
      </footer>
    </div>
  );
}
