"use client"

import { ReactNode, useEffect, useState } from "react"
import { refetchUserAtom } from "@/store"
import { configAtom, configsAtom, currentUserAtom } from "@/store/config.store"
import { orderTypeAtom } from "@/store/order.store"
import { useQuery } from "@apollo/client"
import { useAtom, useSetAtom } from "jotai"

import { hexToHsl } from "@/lib/utils"
import Loader from "@/components/ui/loader"
import { onError } from "@/components/ui/use-toast"

import { queries } from "./graphql"

const Configs = ({ children }: { children: ReactNode }) => {
  const setConfigs = useSetAtom(configsAtom)
  const setCurrentUser = useSetAtom(currentUserAtom)
  const setConfig = useSetAtom(configAtom)
  const [loadingConfigs, setLoadingConfigs] = useState(true)
  const [fetchUser, setFetchUser] = useAtom(refetchUserAtom)
  const setOrderType = useSetAtom(orderTypeAtom)

  const { loading, data, refetch } = useQuery(queries.posCurrentUser)

  const { data: config, loading: loadingConfig } = useQuery(
    queries.currentConfig
  )

  useQuery(queries.configs, {
    onCompleted: (data) => {
      setConfigs(data.posclientConfigs)
      setTimeout(() => setLoadingConfigs(false), 20)
    },
    onError: ({ message }) => {
      onError(message)
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

  const { currentConfig } = config || {}
  const { _id, allowTypes, uiOptions } = currentConfig || {}

  useEffect(() => {
    if (_id) {
      setConfig(currentConfig)
      document.title = currentConfig.name
      setOrderType((allowTypes || [])[0])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
