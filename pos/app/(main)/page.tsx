"use client"

import dynamic from "next/dynamic"
import RequirePassword from "@/modules/checkout/components/cart/RequirePassword"
import { modeAtom } from "@/store"
import { useAtomValue } from "jotai"

const Market: any = dynamic(() => import("./market"))
const Main: any = dynamic(() => import("./main"))
const Kiosk: any = dynamic(() => import("./kiosk"))
const Restaurant: any = dynamic(() => import("./restaurant"))
const Mobile: any = dynamic(() => import("./mobile"))

export default function IndexPage() {
  const mode = useAtomValue(modeAtom)
  return (
    <>
      {mode === "market" && <Market />}
      {["main", "coffee-shop"].includes(mode) && <Main />}
      {mode === "restaurant" && <Restaurant />}
      {mode === "kiosk" && <Kiosk />}
      {mode === "mobile" && <Mobile />}
      <RequirePassword />
    </>
  )
}
