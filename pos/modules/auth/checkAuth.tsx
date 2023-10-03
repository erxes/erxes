"use client"

/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { configAtom, configsAtom, currentUserAtom } from "@/store/config.store"
import { useAtomValue } from "jotai"
import { Loader2, ServerOffIcon } from "lucide-react"

import { cn } from "@/lib/utils"

const checkValidAuth = (currentUser: any, config: any) => {
  const { _id } = currentUser || {}
  const { _id: configId, cashierIds, adminIds } = config || {}

  if (!_id) {
    return false
  }

  if (!configId) {
    return false
  }

  if (![...(cashierIds || {}), ...(adminIds || {})].includes(currentUser._id)) {
    return false
  }

  return true
}

const CheckAuth = ({ children }: any) => {
  const configs = useAtomValue(configsAtom)
  const currentUser = useAtomValue(currentUserAtom)
  const config = useAtomValue(configAtom)

  const pathname = usePathname()
  const router = useRouter()
  const LOGIN = "/login"

  const checkConfigs = Array.isArray(configs) && !!configs.length
  const checkConfigsPath = pathname !== "/init"

  useEffect(() => {
    if (!checkConfigs) {
      if (checkConfigsPath) {
        router.push("/init")
      }
    } else {
      const checkValid = checkValidAuth(currentUser, config)

      if (!checkValid && pathname !== LOGIN) {
        router.push(LOGIN)
        return
      }

      if ((checkValid && pathname === LOGIN) || !checkConfigsPath) {
        router.push("/")
      }
    }
  }, [currentUser, pathname, checkConfigs, config])

  if (!Array.isArray(configs))
    return (
      <div className="flex h-screen flex-col items-center justify-center">
        <ServerOffIcon className={cn("m-4 h-12 w-12")} strokeWidth={0.8} />
        <h5>Network Error</h5>
        <br />
        <p>Сервертэй холбогдоход алдаа гарлаа</p>
      </div>
    )

  if (!checkConfigs) return checkConfigsPath ? null : children

  const checkValid = checkValidAuth(currentUser, config)

  if (checkValid && pathname === LOGIN) return null
  if (checkValid || pathname === LOGIN) return <>{children}</>

  return (
    <div className="flex h-screen  items-center justify-center">
      <Loader2 className="mr-2 animate-spin" /> Уншиж байна...
    </div>
  )
}

export default CheckAuth
