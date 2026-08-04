/** @type {import('next').NextConfig} */
import pwa from 'next-pwa'

const ignoredWatchPaths = [
  '**/.git/**',
  '**/.next/**',
  '**/node_modules/**',
  '**/dist/**',
  '**/coverage/**',
]

const nextConfig = {
  reactStrictMode: false,
  compiler: {
    removeConsole: process.env.NODE_ENV !== 'development',
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
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
      poll: process.env.WATCHPACK_POLLING === 'false' ? undefined : 1000,
    }

    return config
  },
}

const withPWA = pwa({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
})

export default withPWA(nextConfig)
