"use client"

import { ReactNode, useState } from "react"
import { gql, useQuery } from "@apollo/client"
import { useSetAtom } from "jotai"

import { useToast } from "@/components/ui/use-toast"

import { setCurrentUserAtom } from "../JotaiProiveder"
import { queries } from "./graphql"

const ENABLED_SERVICES_QRY = gql`
  query Query {
    enabledServices
  }
`

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

  const enabledServicesQry = useQuery(ENABLED_SERVICES_QRY)

  const enabledServices = enabledServicesQry.data?.enabledServices || []

  localStorage.setItem("enabledServices", JSON.stringify(enabledServices))

  if (loadingConfigs || enabledServicesQry.loading) {
    return <div />
  } else {
    return <>{children}</>
  }
}

export default Configs
