"use client"

import { useMutation } from "@apollo/client"

import { ButtonProps } from "@/components/ui/button"
import { onError, toast } from "@/components/ui/use-toast"

import SettingsButton from "./components/Button"
import { mutations } from "./graphql"

const SyncConfig = ({
  configType,
  ...rest
}: ButtonProps & { configType: "products" | "config" | "slots" }) => {
  const success = () =>
    toast({
      description:
        configType === "config"
          ? "ПОС тохиргоог шинэчиллээ."
          : `${configType} has been synced successfully.`,
    })

  const [syncProductsConfigs, { loading: syncingProductsConfigs }] =
    useMutation(mutations.syncConfig, {
      variables: { type: "productsConfigs" },
      onCompleted: success,
      onError: (error) => onError(error.message),
    })

  const [syncConfig, { loading }] = useMutation(mutations.syncConfig, {
    onCompleted() {
      if (configType !== "config") return success()
      void syncProductsConfigs()
    },
    onError(error) {
      return onError(error.message)
    },
    refetchQueries: ["CurrentConfig", "posclientConfigs"],
    awaitRefetchQueries: true,
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
      loading={loading || syncingProductsConfigs}
    />
  )
}

export default SyncConfig
