/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  allowedDevOrigins: ["100.123.197.94", "100.77.110.74", "localhost", "127.0.0.1"],
}

module.exports = nextConfig