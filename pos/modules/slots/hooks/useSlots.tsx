import { gql, useQuery } from "@apollo/client"

import { queries } from "../graphql"

const useSlots = () => {
  const { data, loading } = useQuery(gql(queries.slots))
  const { poscSlots: slots } = data || {}
  return { slots, loading }
}

export default useSlots
