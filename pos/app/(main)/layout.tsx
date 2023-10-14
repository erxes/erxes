"use client"

import "@/styles/globals.css"

import dynamic from "next/dynamic"
import CheckAuth from "@/modules/auth/checkAuth"
import Configs from "@/modules/auth/configs"
import { modeAtom } from "@/store"
import { useAtomValue } from "jotai"

const EventListener = dynamic(() => import("@/modules/kiosk/EventListener"))

interface LayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: LayoutProps) {
  const mode = useAtomValue(modeAtom)
  return (
    <Configs>
      <CheckAuth>
        <div className="relative flex h-screen flex-col">{children}</div>
      </CheckAuth>
      {mode === "kiosk" && (
        <>
          <style>
            {`
               html {
                  font-size: 32px;
               }
            `}
          </style>
          <EventListener />
        </>
      )}
    </Configs>
  )
}
