import withSerwistInit from "@serwist/next"

/** @type {import('next').NextConfig} */
const ignoredWatchPaths = [
  "**/.git/**",
  "**/.next/**",
  "**/node_modules/**",
  "**/dist/**",
  "**/coverage/**",
]

const nextConfig = {
  reactStrictMode: false,
  turbopack: {},
  compiler: {
    removeConsole: process.env.NODE_ENV !== "development",
  },
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
      },
    ],
  },
  webpack: (config, { dev }) => {
    if (!dev) {
      return config
    }

    config.watchOptions = {
      ...config.watchOptions,
      aggregateTimeout: 300,
      ignored: ignoredWatchPaths,
      poll: process.env.WATCHPACK_POLLING === "false" ? undefined : true,
    }

    return config
  },
}

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
})

export default withSerwist(nextConfig)
