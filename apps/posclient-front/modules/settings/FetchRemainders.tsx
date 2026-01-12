"use client"

import { useMutation } from "@apollo/client"

import { onError, toast } from "@/components/ui/use-toast"

import SettingsButton from "./components/Button"
import { mutations } from "./graphql"

const FetchRemainders = () => {
  const [refetchRemainder, { loading }] = useMutation(mutations.refetchRemainder, {
    onCompleted(data) {
      const { refetchRemainder } = data
      if (refetchRemainder) {
        if (refetchRemainder === 'success') {
          return toast({
            description: `success`,
          })
        }
        return onError(
          `${refetchRemainder.syncedCount} order has been synced successfully`
        )
      }
    },
    onError(error) {
      return toast({ description: error.message })
    },
  })

  const handleClick = () => refetchRemainder()

  return (
    <SettingsButton loading={loading} onClick={handleClick}>
      Fetch remainders
    </SettingsButton>
  )
}

export default FetchRemainders
