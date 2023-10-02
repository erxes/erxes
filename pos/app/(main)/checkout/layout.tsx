"use client"

import dynamic from "next/dynamic"

import { getMode } from "@/lib/utils"

const Main = dynamic(() => import("./layout.main"))
const Kiosk = dynamic(() => import("./layout.kiosk"))

const Layout = ({ children }: { children: React.ReactNode }) => {
  const mode = getMode()
  return (
    <>
      {" "}
      {["main", "coffee-shop"].includes(mode) && <Main>{children}</Main>}
      {mode === "kiosk" && <Kiosk>{children}</Kiosk>}
    </>
  )
}

export default Layout
