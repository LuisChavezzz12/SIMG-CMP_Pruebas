import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    domains: ["res.cloudinary.com"],
  },
  experimental: {
    
  },
};

export default nextConfig;
