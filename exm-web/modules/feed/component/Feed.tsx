"use client"

import dynamic from "next/dynamic"
import { useRouter, useSearchParams } from "next/navigation"

const List = dynamic(() => import("./List"))

const Feed = () => {
  localStorage.getItem("exm_env_REACT_APP_DOMAIN")

  const router = useRouter()
  const searchParams = useSearchParams()

  const type = searchParams.get("contentType")

  const handleClick = (tabType: string) => {
    router.push(`/?contentType=${tabType}`)
  }

  return <List contentType={type || "post"} />
}

export default Feed
