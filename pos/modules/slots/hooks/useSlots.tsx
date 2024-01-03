import { useCallback } from "react"
import { configAtom } from "@/store/config.store"
import { gql, useQuery } from "@apollo/client"
import { useAtomValue } from "jotai"

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

export default useSlots
