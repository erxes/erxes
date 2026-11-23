"use client"

import { useMutation } from "@apollo/client"

import { onError, toast } from "@/components/ui/use-toast"

import SettingsButton from "./components/Button"
import { mutations } from "./graphql"

const SyncOrders = () => {
  const [syncOrders, { loading }] = useMutation(mutations.syncOrders, {
    onCompleted(data) {
      const { syncOrders } = data
      if (syncOrders) {
        if (syncOrders.sumCount > syncOrders.syncedCount) {
          return onError(
            `${syncOrders.syncedCount} захиалга илгээгдлээ, ${
              syncOrders.sumCount - syncOrders.syncedCount
            } илгээгдээгүй`
          )
        }
        return toast({
          description: `${syncOrders.syncedCount} захиалга амжилттай илгээгдлээ`,
        })
      }
    },
    onError(error) {
      return toast({ description: error.message })
    },
  })

  const handleClick = () => syncOrders()

  return (
    <SettingsButton loading={loading} onClick={handleClick}>
      Захиалга илгээх
    </SettingsButton>
  )
}

export default SyncOrders
