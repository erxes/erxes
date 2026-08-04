"use client"

import { useEffect } from "react"
import { thermalPaperWidthAtom } from "@/store"
import { useAtomValue } from "jotai"

const STYLE_ID = "thermal-paper-width-style"

const ThermalPaperWidthApplier = () => {
  const paperWidth = useAtomValue(thermalPaperWidthAtom)

  useEffect(() => {
    if (typeof document === "undefined") return

    const widthMm = `${paperWidth}mm`
    document.documentElement.style.setProperty("--thermal-paper-width", widthMm)

    let style = document.getElementById(STYLE_ID) as HTMLStyleElement | null
    if (!style) {
      style = document.createElement("style")
      style.id = STYLE_ID
      document.head.appendChild(style)
    }
    style.textContent = `:root { --thermal-paper-width: ${widthMm}; } @page { size: ${widthMm} auto; margin: 0; }`
  }, [paperWidth])

  return null
}

export default ThermalPaperWidthApplier
