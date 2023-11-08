import { useCallback } from "react"
import { gql, useQuery } from "@apollo/client"

import { queries, subscriptions } from "../graphql"

const useSlots = () => {
  const { data, loading, subscribeToMore } = useQuery(queries.slots)
  const { poscSlots: slots } = data || {}

  const subToSlots = useCallback(
    () => subscribeToMore({ document: gql(subscriptions.slotsStatusUpdated) }),
    [subscribeToMore]
  )

  return { slots, loading, subToSlots }
}

export default useSlots
