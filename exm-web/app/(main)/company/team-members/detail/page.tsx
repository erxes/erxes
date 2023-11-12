"use client"

import dynamic from "next/dynamic"
import { useRouter, useSearchParams } from "next/navigation"

const Detail = dynamic(() => import("@/modules/team-member/component/Detail"))

export default function IndexPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const id = searchParams.get("id")

  const handleClick = (tabType: string) => {
    router.push(`/company?tab=${tabType}`)
  }

  return (
    <>
      <Detail id={id || ""} handleTabClick={handleClick} />
    </>
  )
}
