import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="min-h-[60vh] flex flex-col items-center justify-center text-center gap-6 px-6">
      <div>
        <h1 className="text-5xl font-extrabold tracking-tight">404</h1>
        <p className="mt-2 text-muted-foreground">We couldn&apos;t find that page.</p>
      </div>
      <div className="flex gap-3">
        <Button asChild>
          <Link href="/">Go home</Link>
        </Button>
        <Button asChild variant="secondary">
          <Link href="/M4RC1L">Open M4RC1L</Link>
        </Button>
      </div>
    </main>
  );
}
