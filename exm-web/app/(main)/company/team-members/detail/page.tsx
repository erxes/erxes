"use client"

import dynamic from "next/dynamic"

const Detail = dynamic(() => import("@/modules/team-member/component/Detail"))

export default function IndexPage() {
  const queryString = window.location.search
  const urlParams = new URLSearchParams(queryString)
  const id = urlParams.get("id")

  return (
    <>
      <Detail id={id || ""} />
    </>
  )
}
