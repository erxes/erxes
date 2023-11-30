"use client"

import { ReactNode, useState } from "react"
import { useQuery } from "@apollo/client"
import { useSetAtom } from "jotai"

import { useToast } from "@/components/ui/use-toast"

import { setCurrentUserAtom } from "../JotaiProiveder"
import { queries } from "./graphql"

const Configs = ({ children }: { children: ReactNode }) => {
  const setCurrentUser = useSetAtom(setCurrentUserAtom)
  const [loadingConfigs, setLoadingConfigs] = useState(true)
  const { onError } = useToast()

  useQuery(queries.currentUser, {
    onCompleted: (data) => {
      setCurrentUser(data?.currentUser)
      setLoadingConfigs(false)
    },
    onError: (error) => {
      setLoadingConfigs(false)
      onError(error)
    },
  })

  if (loadingConfigs) {
    return <div />
  } else {
    return <>{children}</>
  }
}

export default Configs
