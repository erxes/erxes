"use client"

import dynamic from "next/dynamic"
import { modeAtom } from "@/store"
import { useAtomValue } from "jotai"

const Market = dynamic(() => import("./market"))
const Main = dynamic(() => import("./main"))
const Kiosk = dynamic(() => import("./kiosk"))
const Restaurant = dynamic(() => import("./restaurant"))

export default function IndexPage() {
  const mode = useAtomValue(modeAtom)
  return (
    <>
      {mode === "market" && <Market />}
      {["main", "coffee-shop"].includes(mode) && <Main />}
      {mode === "restaurant" && <Restaurant />}
      {mode === "kiosk" && <Kiosk />}
    </>
  )
}
