/* eslint-disable @next/next/no-before-interactive-script-outside-document */
import "@/styles/globals.css"

import { Metadata } from "next"
import Script from "next/script"
import JotaiProvider from "@/store"

import { fontSans } from "@/lib/fonts"
import { cn } from "@/lib/utils"
import { Toaster } from "@/components/ui/toaster"

export const metadata: Metadata = {
  title: "Erxes POS",
  description: "POS integrated with Erxes",
  generator: "Next.js",
  manifest: "/manifest.json",
  icons: [
    { rel: "apple-touch-icon", url: "icons/icon-128x128.png" },
    { rel: "icon", url: "icons/icon-128x128.png" },
  ],
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <>
      <html lang="en" suppressHydrationWarning>
        <head>
          <Script
            strategy="beforeInteractive"
            type="text/javascript"
            src="/js/env.js"
          />
          <meta
            name="viewport"
            content="minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, viewport-fit=cover"
          />
          <meta
            name="theme-color"
            media="(prefers-color-scheme: dark)"
            content="#fff"
          />
        </head>
        <body
          className={cn(
            "h-screen w-screen overflow-hidden bg-background font-sans text-xs font-medium antialiased xl:text-sm flex flex-col",
            fontSans.variable
          )}
        >
          <JotaiProvider>{children}</JotaiProvider>
          <Toaster />
        </body>
      </html>
    </>
  )
}
