import type { NextConfig } from "next";

const backendUrl = process.env.INTERNAL_BACKEND_URL || "http://backend:8000";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${backendUrl}/api/v1/:path*`
      },
      {
        source: "/sanctum/:path*",
        destination: `${backendUrl}/sanctum/:path*`
      }
    ]
  }
};

export default nextConfig;

