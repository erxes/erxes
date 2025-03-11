"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"

import { RoomProvider } from "./RoomProvider"

const Apollo = dynamic(() => import("./apolloClient"))

const Provider = ({ children }: { children: React.ReactNode }) => {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(window as any).envMaps = [
      {
        name: "NEXT_PUBLIC_MAIN_API_DOMAIN",
        processValue: "%NEXT_PUBLIC_MAIN_API_DOMAIN%",
      },
      {
        name: "NEXT_PUBLIC_MAIN_SUBS_DOMAIN",
        processValue: "%NEXT_PUBLIC_MAIN_SUBS_DOMAIN%",
      },
      {
        name: "NEXT_PUBLIC_SERVER_API_DOMAIN",
        processValue: "%NEXT_PUBLIC_SERVER_API_DOMAIN%",
      },
      {
        name: "NEXT_PUBLIC_SERVER_DOMAIN",
        processValue: "%NEXT_PUBLIC_SERVER_DOMAIN%",
      },
      {
        name: "NEXT_PUBLIC_CALLS_APP_ID",
        processValue: "%CALLS_APP_ID%",
      },
      {
        name: "NEXT_PUBLIC_CALLS_APP_SECRET",
        processValue: "%NEXT_PUBLIC_CALLS_APP_SECRET%",
      },
    ]

    const envs = (window as any).env

    Object.keys(envs).forEach((envKey) =>
      localStorage.setItem(
        `call_env_${envKey}`,
        envs[envKey as keyof typeof envs]
      )
    )
    setLoading(false)
  }, [])

  if (loading) {
    return null
  }

  return (
    <Apollo>
      <RoomProvider>{children}</RoomProvider>
    </Apollo>
  )
}

export default Provider
