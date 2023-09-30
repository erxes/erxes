'use client'

import dynamic from "next/dynamic"

import { getMode } from "@/lib/utils"

const Main = dynamic(() => import("./main"))
const Kiosk = dynamic(() => import("./kiosk"))

const Checkout = () => {
  const mode = getMode()
  return (
    <>
      {["main", "coffee-shop"].includes(mode) && <Main />}
      {mode === "kiosk" && <Kiosk />}
    </>
  )
}

export default Checkout
