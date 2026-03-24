import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ['img.youtube.com'],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "50mb",   // covers Server Actions
    },
  },
};

export default nextConfig;
