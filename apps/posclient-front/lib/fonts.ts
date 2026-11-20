import { Roboto_Mono as FontMono, Inter as FontSans } from "next/font/google"

export const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-inter",
})

export const fontMono = FontMono({
  subsets: ["latin", "cyrillic"],
  variable: "--font-roboto-mono",
})
