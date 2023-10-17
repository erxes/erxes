"use client"

import dynamic from "next/dynamic"
import { modeAtom } from "@/store"
import { useAtomValue } from "jotai"

import HeaderLayout from "./headerLayout"

const Market = dynamic(
  () => import("@/modules/products/components/search/search.market")
)

const Main = dynamic(() => import("@/components/header/header.main"))

const Header = () => {
  const mode = useAtomValue(modeAtom)
  return (
    <HeaderLayout>
      <>
        {mode === "main" && <Main />}
        {mode === "market" && <Market />}
      </>
    </HeaderLayout>
  )
}

export default Header
