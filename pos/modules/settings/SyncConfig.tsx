"use client"

import { useLazyQuery, useMutation } from "@apollo/client"
import { useSetAtom } from "jotai"

import { ButtonProps } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

import { setWholeConfigAtom } from "../../store/config.store"
import { queries } from "../auth/graphql"
import SettingsButton from "./components/Button"
import { mutations } from "./graphql"

const refetchQueries = {
  products: ["poscProducts", "poscProductCategories", "productsCount"],
  config: ["SettingConfig", queries.getInitialCategories],
  slots: ["SettingConfig"],
}

const SyncConfig = ({
  configType,
  ...rest
}: ButtonProps & { configType: "products" | "config" | "slots" }) => {
  const { toast } = useToast()
  const setWholeConfig = useSetAtom(setWholeConfigAtom)

  const success = () =>
    toast({
      description: `${configType} has been synced successfully.`,
    })

  const [getWholeConfig, { loading: loadingConfig }] = useLazyQuery(
    queries.getWholeConfig,
    {
      onCompleted(data) {
        const { currentConfig } = data || {}
        setWholeConfig(currentConfig)
        success()
      },
    }
  )

  const [syncConfigProductsConfigs] = useMutation(mutations.syncConfig, {
    variables: { type: "productsConfigs" },
  })

  const [syncConfig, { loading }] = useMutation(mutations.syncConfig, {
    onCompleted() {
      if (configType !== "config") return success()
      syncConfigProductsConfigs()
      getWholeConfig()
    },
    onError(error) {
      return toast({ description: error.message, variant: "destructive" })
    },
    refetchQueries: refetchQueries[configType],
  })

  return (
    <SettingsButton
      {...rest}
      onClick={() =>
        syncConfig({
          variables: {
            type: configType,
          },
        })
      }
      loading={loading || loadingConfig}
    />
  )
}

export default SyncConfig
