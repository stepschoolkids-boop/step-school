import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Book covers / teacher photos live in /public — no remote image hosts needed yet.
  images: { formats: ["image/avif", "image/webp"] },
};

export default nextConfig;
