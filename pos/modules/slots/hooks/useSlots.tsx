import { useQuery } from "@apollo/client"

import { queries } from "../graphql"

const useSlots = () => {
  const { data, loading } = useQuery(queries.slots)
  const { poscSlots: slots } = data || {}
  return { slots, loading }
}

export default useSlots
