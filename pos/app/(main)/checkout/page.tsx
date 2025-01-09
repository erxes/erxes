"use client"

import dynamic from "next/dynamic"
import { modeAtom } from "@/store"
import { useAtomValue } from "jotai"

const Main: any = dynamic(() => import("./main"))
const Kiosk: any = dynamic(() => import("./kiosk"))
const Mobile: any = dynamic(() => import("./mobile"))

const Checkout = () => {
  const mode = useAtomValue(modeAtom)
  return (
    <>
      {["main", "coffee-shop", "restaurant"].includes(mode) && <Main />}
      {mode === "mobile" && <Mobile />}
      {mode === "kiosk" && <Kiosk />}
    </>
  )
}

export default Checkout
