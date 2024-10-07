/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["files.edgestore.dev"],
  },
  experimental: {
    serverActions: true,
  },
};

module.exports = nextConfig;
