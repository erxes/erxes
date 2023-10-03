"use client"

import { getMode } from "@/lib/utils"

import Kiosk from "./layout.kiosk"
import Main from "./layout.main"

const Layout = ({ children }: { children: React.ReactNode }) => {
  const mode = getMode()
  return (
    <>
      {["main", "coffee-shop"].includes(mode) && <Main>{children}</Main>}
      {mode === "kiosk" && <Kiosk>{children}</Kiosk>}
    </>
  )
}

export default Layout
