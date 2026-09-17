import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Hides the floating dev-tools badge in the corner during `next dev`.
  // Compile and runtime errors are still surfaced.
  devIndicators: false,
};

export default nextConfig;
