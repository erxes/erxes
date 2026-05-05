import { gql } from "@apollo/client"

const qrOrderAdd = gql`
  mutation QrOrderAdd(
    $items: [OrderItemInput]
    $totalAmount: Float!
    $type: String!
    $slotCode: String
    $origin: String
    $description: String
  ) {
    ordersAdd(
      items: $items
      totalAmount: $totalAmount
      type: $type
      slotCode: $slotCode
      origin: $origin
      description: $description
    ) {
      _id
      number
    }
  }
`

const mutations = { qrOrderAdd }
export default mutations
