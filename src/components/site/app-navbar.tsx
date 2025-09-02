"use client";
import Link from "next/link";
import { useState } from "react";
import {
  Navbar as RNavbar,
  NavBody,
  NavItems,
  MobileNav,
  MobileNavHeader,
  MobileNavMenu,
  MobileNavToggle,
  NavbarButton,
} from "@/components/ui/resizable-navbar";

const items = [
  { name: "Chat", link: "/M4RC1L" },
  { name: "ImageGen", link: "/imagegen" },
];

export default function AppNavbar() {
  const [open, setOpen] = useState(false);
  return (
    <RNavbar className="top-0">
      <NavBody>
        <Link href="/" className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">M</span>
          <span className="text-sm font-medium">M4RC1L</span>
        </Link>

        <NavItems items={items} onItemClick={() => setOpen(false)} />

        <div className="ml-auto hidden gap-2 lg:flex">
          <NavbarButton as={Link} href="https://github.com/m4rc1ldev" target="_blank" rel="noopener noreferrer" variant="secondary">GitHub</NavbarButton>
          <NavbarButton as={Link} href="https://www.linkedin.com/in/mayank-shukla-4a37b92ab" target="_blank" rel="noopener noreferrer" variant="secondary">LinkedIn</NavbarButton>

        </div>
      </NavBody>

      <MobileNav>
        <MobileNavHeader>
          <Link href="/" className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">M</span>
            <span className="text-sm font-medium">M4RC1L</span>
          </Link>
          <MobileNavToggle isOpen={open} onClick={() => setOpen((o) => !o)} />
        </MobileNavHeader>
        <MobileNavMenu isOpen={open} onClose={() => setOpen(false)}>
          <div className="flex w-full flex-col gap-2">
            {items.map((i) => (
              <Link key={i.link} href={i.link} onClick={() => setOpen(false)} className="px-2 py-2 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800">
                {i.name}
              </Link>
            ))}
            <div className="mt-2 flex gap-2">
              <NavbarButton as={Link} href="https://github.com/m4rc1ldev" target="_blank" rel="noopener noreferrer" className="flex-1" onClick={() => setOpen(false)}>GitHub</NavbarButton>
              <NavbarButton as={Link} href="https://www.linkedin.com/in/mayank-shukla-4a37b92ab" target="_blank" rel="noopener noreferrer" className="flex-1" onClick={() => setOpen(false)}>LinkedIn</NavbarButton>
            </div>
            <div className="mt-2 flex gap-2">
              <NavbarButton as={Link} href="/M4RC1L" className="flex-1" onClick={() => setOpen(false)}>Try M4RC1L</NavbarButton>
              <NavbarButton as={Link} href="/imagegen" variant="dark" className="flex-1" onClick={() => setOpen(false)}>ImageGen</NavbarButton>
            </div>
          </div>
        </MobileNavMenu>
      </MobileNav>
    </RNavbar>
  );
}
