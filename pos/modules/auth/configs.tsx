"use client"

import { ReactNode, useEffect, useState } from "react"
import {
  configAtom,
  setConfigsAtom,
  setCurrentUserAtom,
} from "@/store/config.store"
import { useQuery } from "@apollo/client"
import { useSetAtom } from "jotai"

import { hexToHsl } from "@/lib/utils"
import Loader from "@/components/ui/loader"
import { useToast } from "@/components/ui/use-toast"

import { queries } from "./graphql"

const Configs = ({ children }: { children: ReactNode }) => {
  const setConfigs = useSetAtom(setConfigsAtom)
  const setCurrentUser = useSetAtom(setCurrentUserAtom)
  const setConfig = useSetAtom(configAtom)
  const [loadingConfigs, setLoadingConfigs] = useState(true)
  const { onError } = useToast()

  const { loading, data } = useQuery(queries.posCurrentUser)

  const { data: config, loading: loadingConfig } = useQuery(
    queries.currentConfig
  )

  useQuery(queries.configs, {
    onCompleted: (data) => {
      setConfigs(data.posclientConfigs)
      setLoadingConfigs(false)
    },
    onError: (error) => {
      setLoadingConfigs(false)
      onError(error)
    },
  })

  useEffect(() => {
    setCurrentUser(data?.posCurrentUser)
  }, [data, setCurrentUser])

  useEffect(() => {
    const currentConfig = (config || {}).currentConfig

    if (currentConfig) {
      setConfig(currentConfig)
    }

    const { primary } = currentConfig?.uiOptions?.colors || {}

    if (primary) {
      document.documentElement.style.setProperty(
        "--primary",
        hexToHsl(primary || "#4f33af")
      )
    }
  }, [config, setConfig])

  if (loading || loadingConfig || loadingConfigs)
    return <Loader className="h-screen" />

  return <>{children}</>
}

export default Configs
