import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep default app router behavior; do not enable static export.
  // Opt into React strict mode for better warnings.
  reactStrictMode: true,
  // Ensure trailingSlash is disabled to avoid export-like behavior.
  trailingSlash: false,
};

export default nextConfig;
