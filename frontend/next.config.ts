import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/media/**',
      },
      {
        protocol: 'http',
        hostname: 'api',
        port: '8000',
        pathname: '/media/**',
      },
    ],
  },
  // Enable React strict mode for better performance
  reactStrictMode: true,
  // Optimize CSS
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Enable standalone output for Docker
  output: 'standalone',
  // Skip ESLint and TypeScript checks during build (for Docker)
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
