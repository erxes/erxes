import {
  configAtom,
  coverConfigAtom,
  ebarimtConfigAtom,
  paymentConfigAtom,
} from "@/store/config.store"
import { useQuery } from "@apollo/client"
import { useSetAtom } from "jotai"

import { IConfig, IPaymentConfig, IPaymentType } from "@/types/config.types"
import { strToObj } from "@/lib/utils"

import { queries } from "../graphql"

const queryObject = {
  main: queries.currentConfig,
  payment: queries.getPaymentConfig,
  settings: queries.getSettingsConfig,
  ebarimt: queries.getEbarimtConfig,
  cover: queries.getCoverConfig,
}

const useConfig = (
  type: "payment" | "settings" | "main" | "ebarimt" | "cover",
  options?: {
    onCompleted?: (data: IConfig & IPaymentConfig) => void
    skip?: boolean
  }
  // todo: ts stick
): {
  config: any
  loading: boolean
} => {
  const { onCompleted, skip } = options || {}
  const setEbarimtConfig = useSetAtom(ebarimtConfigAtom)
  const setCoverConfig = useSetAtom(coverConfigAtom)
  const setPaymentConfig = useSetAtom(paymentConfigAtom)
  const setConfig = useSetAtom(configAtom)

  const { data, loading } = useQuery(queryObject[type], {
    onCompleted({ currentConfig }) {
      if (type === "ebarimt") {
        setEbarimtConfig(currentConfig)
      }
      if (["cover", "payment"].includes(type)) {
        const { paymentTypes, ...rest } = currentConfig

        const paymentTypeWithConfig = paymentTypes.map((pt: IPaymentType) => ({
          ...pt,
          config: strToObj(pt.config),
        }))

        const config = { ...rest, paymentTypes: paymentTypeWithConfig }

        if (type === "cover") {
          setCoverConfig(config)
        }
        if (type === "payment") {
          setPaymentConfig(config)
        }
      }

      if (type === "main") {
        setConfig(currentConfig)
      }
      onCompleted && onCompleted(currentConfig)
    },
    skip: !type || skip,
  })

  const { currentConfig: config } = data || {}

  return { config: config || {}, loading }
}

export default useConfig
