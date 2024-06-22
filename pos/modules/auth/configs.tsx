"use client"

import { ReactNode, useEffect, useState } from "react"
import { modeAtom, refetchUserAtom } from "@/store"
import { configAtom, configsAtom, currentUserAtom } from "@/store/config.store"
import { orderTypeAtom } from "@/store/order.store"
import { useQuery } from "@apollo/client"
import { useAtom, useSetAtom } from "jotai"

import { useMediaQuery } from "@/lib/useMediaQuery"
import { hexToHsl } from "@/lib/utils"
import Loader from "@/components/ui/loader"
import { useToast } from "@/components/ui/use-toast"

import { queries } from "./graphql"

const Configs = ({ children }: { children: ReactNode }) => {
  const setConfigs = useSetAtom(configsAtom)
  const setCurrentUser = useSetAtom(currentUserAtom)
  const setConfig = useSetAtom(configAtom)
  const [loadingConfigs, setLoadingConfigs] = useState(true)
  const { onError } = useToast()
  const [fetchUser, setFetchUser] = useAtom(refetchUserAtom)
  const setOrderType = useSetAtom(orderTypeAtom)
  const setMode = useSetAtom(modeAtom)
  const isMobile = useMediaQuery("(max-width: 768px)")

  const { loading, data, refetch } = useQuery(queries.posCurrentUser)

  const { data: config, loading: loadingConfig } = useQuery(
    queries.currentConfig
  )

  useQuery(queries.configs, {
    onCompleted: (data) => {
      setConfigs(data.posclientConfigs)
      setTimeout(() => setLoadingConfigs(false), 20)
    },
    onError: (error) => {
      onError(error)
      setTimeout(() => setLoadingConfigs(false), 20)
    },
  })

  useEffect(() => {
    if (fetchUser) {
      refetch()
      setFetchUser(false)
    }
  }, [fetchUser, refetch, setFetchUser])

  useEffect(() => {
    setCurrentUser(data?.posCurrentUser)
  }, [data, setCurrentUser])

  useEffect(() => {
    if (isMobile) {
      setMode("mobile")
    }
  }, [isMobile, setMode])

  const { currentConfig } = config || {}
  const { _id, allowTypes, uiOptions } = currentConfig || {}

  useEffect(() => {
    if (_id) {
      setConfig(currentConfig)
      setOrderType((allowTypes || [])[0])
    }
  }, [config])

  if (loading || loadingConfig || loadingConfigs)
    return <Loader className="h-screen" />

  const { primary } = uiOptions?.colors || {}

  return (
    <>
      <style>{`
         :root {
           ${
             primary
               ? `--primary: ${hexToHsl(primary)};
             `
               : ""
           }
          }
        `}</style>
      {children}
    </>
  )
}

export default Configs
