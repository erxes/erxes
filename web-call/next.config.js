/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "https",
        hostname: "**",
      },
    ],

    domains: ["s3.ap-southeast-1.amazonaws.com", "rtc.live.cloudflare.com"],
  },
}

module.exports = nextConfig
