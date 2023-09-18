"use client"

import dynamic from "next/dynamic"

import { getMode } from "@/lib/utils"

import HeaderLayout from "./headerLayout"

const Market = dynamic(
  () => import("@/modules/products/components/search/search.market")
)

const Main = dynamic(() => import("@/components/header/header.main"))

const Header = () => {
  const mode = getMode()
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
