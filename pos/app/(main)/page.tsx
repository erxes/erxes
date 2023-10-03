"use client"

import dynamic from "next/dynamic"

import { getMode } from "@/lib/utils"

const Market = dynamic(() => import("./market"))
const Main = dynamic(() => import("./main"))
const Kiosk = dynamic(() => import("./kiosk"))

export default function IndexPage() {
  const mode = getMode()
  return (
    <>
      {mode === "market" && <Market />}
      {["main", "coffee-shop"].includes(mode) && <Main />}
      {mode === "kiosk" && <Kiosk />}
    </>
  )
}
