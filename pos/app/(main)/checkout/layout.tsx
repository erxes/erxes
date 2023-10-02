"use client"

import dynamic from "next/dynamic"

import { getMode } from "@/lib/utils"
import Loader from "@/components/ui/loader"

const Main = dynamic(() => import("./layout.main"), {
  loading() {
    return <Loader className="h-screen"></Loader>
  },
})
const Kiosk = dynamic(() => import("./layout.kiosk"), {
  loading() {
    return <Loader className="h-screen"></Loader>
  },
})

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
