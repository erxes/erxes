import { gql, useQuery } from "@apollo/client"

const POSC_PRODUCT_CONDITION_GROUPS = gql`
  query poscProductConditionGroups($ids: [String!]!) {
    poscProductConditionGroups(ids: $ids) {
      _id
      name
      conditions {
        _id
        name
      }
    }
  }
`

export interface ProductConditionGroup {
  _id: string
  name: string
  conditions: { _id: string; name: string }[]
}

// Lines of the same group share one cached request.
export const useProductConditionGroup = (groupId?: string | null) => {
  const { data, loading } = useQuery<{
    poscProductConditionGroups: ProductConditionGroup[]
  }>(POSC_PRODUCT_CONDITION_GROUPS, {
    variables: { ids: [groupId] },
    skip: !groupId,
  })

  return {
    group: data?.poscProductConditionGroups?.[0] || null,
    loading,
  }
}
