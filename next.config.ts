import {withSentryConfig} from "@sentry/nextjs";
import withBundleAnalyzer from '@next/bundle-analyzer'
import type { NextConfig } from "next";

// Use process.env directly instead of importing from environment config
// to avoid circular dependency during Next.js config loading
const isProduction = process.env.NODE_ENV === 'production';
const analyzeBundle = process.env.ANALYZE === 'true';

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    ignoreDuringBuilds: false, // Enable ESLint in production builds
  },
  typescript: {
    ignoreBuildErrors: false, // Enable TypeScript checking in production builds
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'ik.imagekit.io',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
    formats: ['image/webp', 'image/avif'], // Enable modern image formats
    minimumCacheTTL: 60, // Cache images for 1 minute minimum
  },
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
  compiler: {
    removeConsole: isProduction, // Remove console.log in production
  },
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'], // Optimize package imports
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  // Enable compression
  compress: true,
  // Enable static optimization
  trailingSlash: false,
  // Security headers
  poweredByHeader: false,
};

// Bundle analyzer configuration
const bundleAnalyzer = withBundleAnalyzer({
  enabled: analyzeBundle,
})

// Compose all the configurations
const composedConfig = bundleAnalyzer(nextConfig)

export default withSentryConfig(composedConfig, {
  // Sentry config remains the same
  org: "falcode",
  project: "javascript-nextjs",
  silent: !process.env.CI, // CI is not in our schema, keep as is
  widenClientFileUpload: true,
  disableLogger: true,
  automaticVercelMonitors: true,
});
