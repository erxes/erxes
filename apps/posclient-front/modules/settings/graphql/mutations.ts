import { gql } from "@apollo/client"

const syncOrders = gql`
  mutation syncOrders {
    syncOrders
  }
`
const refetchRemainder = gql`
  mutation refetchRemainder($categoryId: String, $searchValue: String) {
    refetchRemainder (categoryId: $categoryId, searchValue: $searchValue)
  }
`

const deleteOrders = gql`
  mutation deleteOrders {
    deleteOrders
  }
`

const syncConfig = gql`
  mutation syncConfig($type: String!) {
    syncConfig(type: $type)
  }
`

const mutations = { syncConfig, syncOrders, deleteOrders, refetchRemainder }

export default mutations
