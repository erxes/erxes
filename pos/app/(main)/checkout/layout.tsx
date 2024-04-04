"use client"

import { modeAtom } from "@/store"
import { useAtomValue } from "jotai"

import Kiosk from "./layout.kiosk"
import Main from "./layout.main"

const Layout = ({ children }: { children: React.ReactNode }) => {
  const mode = useAtomValue(modeAtom)
  return (
    <>
      {["main", "coffee-shop", "restaurant"].includes(mode) && (
        <Main>{children}</Main>
      )}
      {mode === "kiosk" && <Kiosk>{children}</Kiosk>}
      {mode === "mobile" && (
        <div className="relative flex flex-auto items-center justify-center bg-neutral-100">
          {children}
        </div>
      )}
    </>
  )
}

export default Layout
