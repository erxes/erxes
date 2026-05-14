const ordersOrdered = `
  subscription ordersOrdered($statuses: [String], $customerId: String, $token: String) {
    ordersOrdered(statuses: $statuses, customerId: $customerId, posToken: $token) {
      _id
    }
  }
`
const orderItemsOrdered = `
  subscription orderItemsOrdered($statuses: [String], $token: String) {
    orderItemsOrdered(statuses: $statuses, posToken: $token) {
      _id
    }
  }
`

const invoiceUpdated = `
  subscription invoiceUpdated($_id: String!) {
    invoiceUpdated(_id: $_id)
  }
`

const subscriptions = {
  ordersOrdered,
  orderItemsOrdered,
  invoiceUpdated,
}

export default subscriptions
