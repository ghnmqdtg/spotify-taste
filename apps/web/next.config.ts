import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Note: `output: "export"` is incompatible with the /api/auth/refresh route.
  // Use standard mode for dev. For static deployment, the refresh route needs
  // to be extracted to a separate serverless function.
  images: {
    unoptimized: true,
  },
  transpilePackages: [
    "@spotify-taste/spotify-client",
    "@spotify-taste/ui",
  ],
};

export default nextConfig;
