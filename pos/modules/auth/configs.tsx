"use client"

import { ReactNode, useEffect, useState } from "react"
import {
  configAtom,
  setConfigsAtom,
  setCurrentUserAtom,
} from "@/store/config.store"
import { useQuery } from "@apollo/client"
import { useAtom, useSetAtom } from "jotai"
import { Loader2 } from "lucide-react"

import { hexToHsl } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"

import { queries } from "./graphql"

const Configs = ({ children }: { children: ReactNode }) => {
  const setConfigs = useSetAtom(setConfigsAtom)
  const setCurrentUser = useSetAtom(setCurrentUserAtom)
  const [conf, setConfig] = useAtom(configAtom)
  const [loadingConfigs, setLoadingConfigs] = useState(true)
  const { onError } = useToast()

  const { loading, data } = useQuery(queries.posCurrentUser)

  const { data: config, loading: loadingConfig } = useQuery(
    queries.currentConfig,
    { skip: !!conf }
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
    return (
      <div className="flex h-screen  items-center justify-center">
        <Loader2 className="mr-2 animate-spin" /> Уншиж байна...
      </div>
    )

  return <>{children}</>
}

export default Configs
