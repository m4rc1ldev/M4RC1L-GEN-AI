import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep default app router behavior; do not enable static export.
  // Opt into React strict mode for better warnings.
  reactStrictMode: true,
  // Ensure trailingSlash is disabled to avoid export-like behavior.
  trailingSlash: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.twblocks.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'image.pollinations.ai',
        pathname: '/**',
      }
    ]
  }
};

export default nextConfig;
