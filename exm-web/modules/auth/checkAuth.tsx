"use client"

/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useAtomValue } from "jotai"
import { Loader2 } from "lucide-react"

import { currentUserAtom } from "../JotaiProiveder"

const checkValidAuth = (currentUser: any) => {
  const { _id } = currentUser || {}

  if (!_id) {
    return false
  }

  return true
}

const CheckAuth = ({ children }: any) => {
  const currentUser = useAtomValue(currentUserAtom)

  const pathname = usePathname()
  const router = useRouter()
  const LOGIN = "/login"

  useEffect(() => {
    const valid = checkValidAuth(currentUser)

    if (!valid && pathname !== LOGIN) {
      router.push(LOGIN)
      return
    }

    if (valid && pathname === LOGIN) {
      router.push("/")
    }
  }, [currentUser, pathname])

  const checkValid = checkValidAuth(currentUser)

  if (checkValid && pathname === LOGIN) {
    return null
  }
  if (checkValid || pathname === LOGIN) {
    return <>{children}</>
  }

  return <div />
}

export default CheckAuth
