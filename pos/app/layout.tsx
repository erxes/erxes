/* eslint-disable @next/next/no-before-interactive-script-outside-document */
import "@/styles/globals.css"
import { Metadata } from "next"
import Script from "next/script"
import ApolloProvider from "@/modules/ApolloProvider"
import JotaiProvider from "@/store"

import { siteConfig } from "@/config/site"
import { fontSans } from "@/lib/fonts"
import { cn } from "@/lib/utils"
import { Toaster } from "@/components/ui/toaster"

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
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
        </head>
        <body
          className={cn(
            "h-screen w-screen overflow-hidden bg-background font-sans text-xs font-medium antialiased xl:text-sm flex flex-col",
            fontSans.variable
          )}
        >
          <ApolloProvider>
            <JotaiProvider>{children}</JotaiProvider>
          </ApolloProvider>
          <Toaster />
        </body>
      </html>
    </>
  )
}
