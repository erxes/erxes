import ApolloProvider from "@/modules/ApolloProvider"

import "@/styles/globals.css"
import { Metadata } from "next"
import Script from "next/script"
import JotaiProvider from "@/modules/JotaiProiveder"
import CheckAuth from "@/modules/auth/checkAuth"
import Configs from "@/modules/auth/configs"

import { fontSans } from "@/lib/fonts"
import { cn } from "@/lib/utils"
import { Toaster } from "@/components/ui/toaster"

export const metadata: Metadata = {
  title: "exm",
  description: "exm",
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
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
        suppressHydrationWarning={true}
      >
        <ApolloProvider>
          <JotaiProvider>
            <Configs>
              <CheckAuth>{children}</CheckAuth>
            </Configs>
          </JotaiProvider>
        </ApolloProvider>
        <Toaster />
      </body>
    </html>
  )
}
