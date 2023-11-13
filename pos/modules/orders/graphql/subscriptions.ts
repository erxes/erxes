import { orderFields } from "./queries"

const ordersOrdered = `
  subscription ordersOrdered($statuses: [String], $customerId: String) {
    ordersOrdered(statuses: $statuses, customerId: $customerId) {
      ${orderFields}
      items {
        _id
        unitPrice
        orderId
        productName
        count
        productId
        isPackage
        isTake
        status
      }
    }
  }
`
const orderItemsOrdered = `
  subscription orderItemsOrdered($statuses: [String]) {
    orderItemsOrdered(statuses: $statuses) {
      _id
    }
  }
`

const subscriptions = {
  ordersOrdered,
  orderItemsOrdered,
}

export default subscriptions
