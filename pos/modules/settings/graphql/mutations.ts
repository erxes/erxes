import { gql } from "@apollo/client"

const syncOrders = gql`
  mutation syncOrders {
    syncOrders
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

const mutations = { syncConfig, syncOrders, deleteOrders }

export default mutations
