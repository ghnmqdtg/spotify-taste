import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Note: `output: "export"` is incompatible with the /api/auth/refresh route.
  // Use standard mode for dev. For static deployment, the refresh route needs
  // to be extracted to a separate serverless function.
  images: {
    unoptimized: true,
  },
  transpilePackages: [
    "@spotify-liked-songs-manager/spotify-client",
    "@spotify-liked-songs-manager/ui",
  ],
};

export default nextConfig;
