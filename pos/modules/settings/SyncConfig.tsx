"use client"

import { useLazyQuery, useMutation } from "@apollo/client"

import { ButtonProps } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

import { queries } from "../auth/graphql"
import SettingsButton from "./components/Button"
import { mutations } from "./graphql"

const refetchQueries = {
  products: ["poscProducts", "poscProductCategories", "productsCount"],
  config: [
    "SettingConfig",
    queries.getInitialCategories,
    queries.getCheckoutConfig,
  ],
  slots: ["SettingConfig"],
}

const SyncConfig = ({
  configType,
  ...rest
}: ButtonProps & { configType: "products" | "config" | "slots" }) => {
  const { toast } = useToast()

  const success = () =>
    toast({
      description: `${configType} has been synced successfully.`,
    })
  const [getWholeConfig, { loading: loadingConfig }] = useLazyQuery(
    queries.getWholeConfig,
    {
      onCompleted(data) {
        const {} = data?.currentConfig || {}
        success()
      },
    }
  )

  const [syncConfigProductsConfigs] = useMutation(mutations.syncConfig, {
    variables: { type: "productsConfigs" },
  })

  const [syncConfig, { loading }] = useMutation(mutations.syncConfig, {
    variables: {
      type: configType,
    },
    onCompleted() {
      if (configType !== "config") {
        return success()
      }

      syncConfigProductsConfigs()

      getWholeConfig()
    },
    onError(error) {
      return toast({ description: error.message, variant: "destructive" })
    },
    refetchQueries: refetchQueries[configType],
  })

  const handleClick = () => syncConfig()
  return (
    <SettingsButton
      {...rest}
      onClick={handleClick}
      loading={loading || loadingConfig}
    />
  )
}

export default SyncConfig
