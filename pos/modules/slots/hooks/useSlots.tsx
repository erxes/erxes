import { useCallback } from "react"
import { selectedTabAtom, slotFilterAtom } from "@/store"
import { configAtom } from "@/store/config.store"
import { setInitialAtom, slotCodeAtom } from "@/store/order.store"
import { gql, useQuery } from "@apollo/client"
import { useAtom, useAtomValue, useSetAtom } from "jotai"

import { ISlot } from "@/types/slots.type"

import { queries, subscriptions } from "../graphql"

const useSlots = () => {
  const { data, loading, subscribeToMore } = useQuery(queries.slots)
  const { poscSlots: slots } = data || {}
  const config = useAtomValue(configAtom)
  const { token } = config || {}

  const subToSlots = useCallback(
    () =>
      subscribeToMore({
        document: gql(subscriptions.slotsStatusUpdated),
        variables: { token },
        updateQuery: (prev, { subscriptionData }) => {
          if (!subscriptionData.data) return prev

          const changedSlots = subscriptionData.data.slotsStatusUpdated || []
          const { poscSlots } = prev || {}

          return {
            poscSlots: poscSlots.map(
              (sl: ISlot) =>
                changedSlots.find((slot: ISlot) => slot._id === sl._id) || sl
            ),
          }
        },
      }),
    [subscribeToMore, token]
  )

  return { slots, loading, subToSlots }
}

export const useCreateSlots = ({ code }: { code: string }) => {
  const setInitial = useSetAtom(setInitialAtom)
  const [slotCode, setSlot] = useAtom(slotCodeAtom)
  const setSelectedTab = useSetAtom(selectedTabAtom)
  const [slotFilter, setSlotFilter] = useAtom(slotFilterAtom)
  const handleCreate = () => {
    if (slotCode === code) {
      return setSlot(null)
    }
    setInitial()
    setSlot(code)
    setSelectedTab("products")
    slotFilter !== code && setSlotFilter("")
  }
  return { handleCreate }
}

export default useSlots
