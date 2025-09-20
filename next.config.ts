import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep default app router behavior; do not enable static export.
  // Opt into React strict mode for better warnings.
  reactStrictMode: true,
  // Ensure trailingSlash is disabled to avoid export-like behavior.
  trailingSlash: false,
  // Performance optimizations
  compress: true,
  poweredByHeader: false,
  // Bundle analyzer and optimization
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
  turbopack: {
    resolveAlias: {
      underscore: 'lodash',
      mocha: { browser: 'mocha/browser-entry.js' },
    },
  },
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
    ],
    // Image optimization settings
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  }
};

export default nextConfig;
