"use client"

import { ReactNode, useState } from "react"
import { useQuery } from "@apollo/client"
import { useSetAtom } from "jotai"

import { useToast } from "@/components/ui/use-toast"

import { setExmAtom } from "./JotaiProiveder"
import { queries } from "./auth/graphql"

const ExmProvider = ({ children }: { children: ReactNode }) => {
  const setExm = useSetAtom(setExmAtom)
  const [loadingConfigs, setLoadingConfigs] = useState(true)
  const { onError } = useToast()

  useQuery(queries.exmGets, {
    onCompleted: (data) => {
      setExm(data?.exmGet)
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

export default ExmProvider
