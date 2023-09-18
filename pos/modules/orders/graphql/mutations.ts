import { gql } from "@apollo/client"

const addEditParamDefs = `
    $items: [OrderItemInput],
    $totalAmount: Float!,
    $type: String!, 
    $customerId: String, 
    $customerType: String, 
    $slotCode: String, 
    $registerNumber: String, 
    $billType: String, 
    $origin: String, 
    $deliveryInfo: JSON
    $buttonType: String
    $dueDate: Date
`

const addEditParams = `
    items: $items, 
    totalAmount: $totalAmount, 
    type: $type, 
    customerId: $customerId, 
    customerType: $customerType, 
    slotCode: $slotCode, 
    registerNumber: $registerNumber, 
    billType: $billType, 
    origin: $origin, 
    deliveryInfo: $deliveryInfo
    buttonType: $buttonType
    dueDate: $dueDate
`

const ordersAdd = gql`
  mutation ordersAdd(${addEditParamDefs}) {
    ordersAdd(${addEditParams}) {
     _id
    }
  }
`

const ordersEdit = gql`
  mutation ordersEdit($_id: String!, ${addEditParamDefs}) {
    ordersEdit(_id: $_id, ${addEditParams}) {
      _id
    }
  }
`

const orderChangeStatus = gql`
  mutation orderChangeStatus($_id: String!, $status: String) {
    orderChangeStatus(_id: $_id, status: $status) {
      _id
      status
    }
  }
`

const orderItemChangeStatus = gql`
  mutation orderItemChangeStatus($_id: String!, $status: String) {
    orderItemChangeStatus(_id: $_id, status: $status) {
      _id
      status
    }
  }
`

const mutations = {
  ordersAdd,
  ordersEdit,
  orderChangeStatus,
  orderItemChangeStatus,
}

export default mutations
