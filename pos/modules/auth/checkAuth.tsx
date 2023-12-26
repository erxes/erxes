"use client"

/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react"
import { configAtom, configsAtom, currentUserAtom } from "@/store/config.store"
import { useAtomValue } from "jotai"
import { Loader2, ServerOffIcon } from "lucide-react"

import { cn } from "@/lib/utils"

import ConfigsFetch from "./configsFetch"
import Login from "./LoginPage"

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
      <div className="flex h-screen flex-col items-center justify-center">
        <ServerOffIcon className={cn("m-4 h-12 w-12")} strokeWidth={0.8} />
        <h5>Network Error</h5>
        <br />
        <p>Сервертэй холбогдоход алдаа гарлаа</p>
      </div>
    )

  if (show === "init") return <ConfigsFetch />

  if (show === "login") return <Login />

  if (show === "private") return children

  return (
    <div className="flex h-screen  items-center justify-center">
      <Loader2 className="mr-2 animate-spin" /> Уншиж байна...
    </div>
  )
}

export default CheckAuth
