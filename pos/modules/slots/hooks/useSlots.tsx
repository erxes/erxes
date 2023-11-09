import { useCallback } from "react"
import { gql, useQuery } from "@apollo/client"

import { queries, subscriptions } from "../graphql"

const useSlots = () => {
  const { data, loading, subscribeToMore, refetch } = useQuery(queries.slots)
  const { poscSlots: slots } = data || {}

  const subToSlots = useCallback(
    () =>
      subscribeToMore({
        document: gql(subscriptions.slotsStatusUpdated),
        updateQuery: (prev, { subscriptionData }) => {
          if (!subscriptionData.data) return prev
          const changedSlot = subscriptionData.data.slotsStatusUpdated
          !!changedSlot && refetch()

          return prev
        },
      }),
    [refetch, subscribeToMore]
  )

  return { slots, loading, subToSlots }
}

export default useSlots
