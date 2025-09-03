export default function UpgradePage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-xl text-center">
        <div className="text-3xl sm:text-4xl font-semibold tracking-tight mb-3">Coming soon</div>
        <p className="text-muted-foreground mb-6">
          We’re working on M4RC1L Pro—faster responses, priority models, and more customization.
        </p>
        <div className="rounded-2xl border bg-background p-5 text-left">
          <div className="text-sm font-medium mb-2">What to expect:</div>
          <ul className="list-disc pl-5 text-sm space-y-1">
            <li>Access to premium models and higher rate limits</li>
            <li>Conversation history synced across devices</li>
            <li>Advanced tools and integrations</li>
          </ul>
        </div>
        <div className="mt-6 text-sm opacity-70">Stay tuned—subscriptions open soon.</div>
      </div>
    </div>
  );
}
