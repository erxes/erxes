import ApolloProvider from "@/modules/ApolloProvider"

import "./globals.css"
import { Metadata } from "next"
import JotaiProvider from "@/modules/JotaiProiveder"

import { fontSans } from "@/lib/fonts"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Exm ",
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
      <body
        className={cn(
          "h-screen w-screen overflow-hidden bg-background font-sans text-xs font-medium antialiased xl:text-sm flex flex-col",
          fontSans.variable
        )}
        suppressHydrationWarning={true}
      >
        <ApolloProvider>
          <JotaiProvider>{children}</JotaiProvider>
        </ApolloProvider>
      </body>
    </html>
  )
}
