"use client"

import dynamic from "next/dynamic"

import { getMode } from "@/lib/utils"

const loading = () => <div className="h-16 w-full borde-b" />

const Market = dynamic(
  () => import("@/components/header/headerLayout.market"),
  { loading }
)

const Main = dynamic(() => import("@/components/header/headerLayout.main"), {
  loading,
})

const HeaderLayout = (props: {
  children?: React.ReactNode
  hideUser?: boolean
}) => {
  const mode = getMode()

  return (
    <>
      {["coffee-shop", "main"].includes(mode) && <Main {...props} />}
      {mode === "market" && <Market {...props} />}
    </>
  )
}

export default HeaderLayout
