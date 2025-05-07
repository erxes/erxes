import ApolloProvider from "@/modules/ApolloProvider"

import "@/styles/globals.css"
import { Metadata } from "next"
import Script from "next/script"

import { fontSans } from "@/lib/fonts"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Web call",
  description: "Web call",
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
        <link
          rel="stylesheet"
          type="text/css"
          charSet="UTF-8"
          href="https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.6.0/slick.min.css"
        />
        <link
          rel="stylesheet"
          type="text/css"
          href="https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.6.0/slick-theme.min.css"
        />
        <script src="https://unpkg.com/wavesurfer.js@7" />
        <script
          src="https://cdnjs.cloudflare.com/ajax/libs/webrtc-adapter/8.1.2/adapter.min.js"
          integrity="sha512-l40eBFtXx+ve5RryIELC3y6/OM6Nu89mLGQd7fg1C93tN6XrkC3supb+/YiD/Y+B8P37kdJjtG1MT1kOO2VzxA=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        ></script>
      </head>
      <body
        className={cn(
          "h-screen w-screen overflow-hidden bg-background font-sans text-xs font-medium antialiased xl:text-sm flex flex-col",
          fontSans.variable
        )}
        suppressHydrationWarning={true}
      >
        <ApolloProvider>{children}</ApolloProvider>
      </body>
    </html>
  )
}
