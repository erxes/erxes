"use client"

import { ReactNode, useEffect, useState } from "react"
import { refetchUserAtom } from "@/store"
import { configAtom, configsAtom, currentUserAtom } from "@/store/config.store"
import { orderTypeAtom } from "@/store/order.store"
import { useMutation, useQuery } from "@apollo/client"
import { useAtom, useSetAtom } from "jotai"

import { hexToHsl } from "@/lib/utils"
import Loader from "@/components/ui/loader"
import { onError } from "@/components/ui/use-toast"

import { mutations, queries } from "./graphql"

const Configs = ({ children }: { children: ReactNode }) => {
  const setConfigs = useSetAtom(configsAtom)
  const setCurrentUser = useSetAtom(currentUserAtom)
  const setConfig = useSetAtom(configAtom)
  const [loadingConfigs, setLoadingConfigs] = useState(true)
  const [fetchUser, setFetchUser] = useAtom(refetchUserAtom)
  const setOrderType = useSetAtom(orderTypeAtom)
  const [configs] = useAtom(configsAtom)
  const [autoSelectAttempted, setAutoSelectAttempted] = useState(false)

  const { loading, data, refetch } = useQuery(queries.posCurrentUser)

  const { data: config, loading: loadingConfig } = useQuery(
    queries.currentConfig
  )

  const [chooseConfig, { loading: choosingConfig }] = useMutation(
    mutations.chooseConfig,
    {
      refetchQueries: ["CurrentConfig"],
      onError({ message }) {
        onError(message)
      },
    }
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
      setAutoSelectAttempted(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config])

  // Auto-select first POS if no currentConfig exists
  useEffect(() => {
    if (
      !loadingConfig &&
      !loadingConfigs &&
      !_id &&
      configs &&
      configs.length > 0 &&
      !autoSelectAttempted &&
      !choosingConfig
    ) {
      setAutoSelectAttempted(true)
      chooseConfig({ variables: { token: configs[0].token } })
    }
  }, [
    loadingConfig,
    loadingConfigs,
    _id,
    configs,
    autoSelectAttempted,
    choosingConfig,
    chooseConfig,
  ])

  if (loading || loadingConfig || loadingConfigs || choosingConfig)
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
