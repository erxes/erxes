"use client"

import { useEffect, useState } from "react"
import { configAtom, configsAtom, currentUserAtom } from "@/store/config.store"
import { useAtomValue } from "jotai"
import { Loader2, RefreshCwIcon, ServerOffIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

import ConfigsFetch from "./configsFetch"
import { LoginPage } from "./LoginPage"

const checkValidAuth = (currentUser: any, config: any) => {
  const { _id } = currentUser || {}
  const { _id: configId, cashierIds, adminIds } = config || {}

  if (!_id) {
    return false
  }

  if (!configId) {
    return false
  }

  if (
    ![...(cashierIds || []).concat(adminIds || [])].includes(currentUser._id)
  ) {
    return false
  }

  return true
}

const CheckAuth = ({ children }: any) => {
  const configs = useAtomValue(configsAtom)
  const currentUser = useAtomValue(currentUserAtom)
  const config = useAtomValue(configAtom)
  const [show, setShow] = useState<"login" | "init" | "private" | null>(null)

  const isConfigsFetched = Array.isArray(configs) && !!configs.length

  useEffect(() => {
    if (!isConfigsFetched) return setShow("init")

    const checkValid = checkValidAuth(currentUser, config)

    if (!checkValid) return setShow("login")

    if (checkValid) return setShow("private")
  }, [currentUser, isConfigsFetched, config])

  if (!Array.isArray(configs))
    return (
      <div className="flex h-screen items-center justify-center bg-muted p-4">
        <div className="flex w-full max-w-sm flex-col items-center rounded-2xl bg-background p-8 text-center shadow-xl">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
            <ServerOffIcon className="h-6 w-6" strokeWidth={1.5} />
          </div>
          <h3 className="mt-4 text-base font-semibold">
            Сервертэй холбогдож чадсангүй
          </h3>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Сервер ажиллаж байгаа эсэх, интернэт холболтоо шалгаад дахин
            оролдоно уу
          </p>
          <Button
            className="mt-6 h-10 w-full font-semibold"
            onClick={() => window.location.reload()}
          >
            <RefreshCwIcon className="mr-2 h-4 w-4" />
            Дахин оролдох
          </Button>
        </div>
      </div>
    )

  if (show === "init") return <ConfigsFetch />

  if (show === "login") return <LoginPage />

  if (show === "private") return children

  return (
    <div className="flex h-screen items-center justify-center font-medium text-muted-foreground">
      <Loader2 className="mr-2 animate-spin text-primary" /> Уншиж байна...
    </div>
  )
}

export default CheckAuth
