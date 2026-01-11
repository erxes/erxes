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
      description: `${configType} has been synced successfully.`,
    })

  const [syncConfigProductsConfigs] = useMutation(mutations.syncConfig, {
    variables: { type: "productsConfigs" },
  })

  const [syncConfig, { loading }] = useMutation(mutations.syncConfig, {
    onCompleted() {
      if (configType !== "config") return success()
      syncConfigProductsConfigs()
    },
    onError(error) {
      return onError(error.message)
    },
    refetchQueries: ["CurrentConfig"],
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
      loading={loading}
    />
  )
}

export default SyncConfig
