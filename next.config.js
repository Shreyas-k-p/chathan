/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // 🛰️ SaaS Matrix Registry: Node Deployment Compatibility Policy
  /* Ensure browser inspection does not leak internal node structures */
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true, 
  }
};

module.exports = nextConfig;
