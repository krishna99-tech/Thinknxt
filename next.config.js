/** @type {import('next').NextConfig} */
const INTERNAL_BACKEND_URL =
  process.env.INTERNAL_BACKEND_URL || "http://thingsnxt-backend:8000";

const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  allowedDevOrigins: ["localhost", "127.0.0.1"],
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${INTERNAL_BACKEND_URL}/:path*`,
      },
      {
        source: "/workspaces/:workspaceId/logo",
        destination: `${INTERNAL_BACKEND_URL}/workspaces/:workspaceId/logo`,
      },
      {
        source: "/admin/workspaces/:workspaceId/logo",
        destination: `${INTERNAL_BACKEND_URL}/admin/workspaces/:workspaceId/logo`,
      },
    ];
  },
};

module.exports = nextConfig;