/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
      },
    ],

    domains: ["s3.ap-southeast-1.amazonaws.com"],
  },
}

module.exports = nextConfig
