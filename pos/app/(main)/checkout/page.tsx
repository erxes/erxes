"use client"

import dynamic from "next/dynamic"
import { modeAtom } from "@/store"
import { useAtomValue } from "jotai"

const Main = dynamic(() => import("./main"))
const Kiosk = dynamic(() => import("./kiosk"))
const Mobile = dynamic(() => import("./mobile"))

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
