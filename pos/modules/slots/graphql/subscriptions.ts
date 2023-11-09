const slotsStatusUpdated = `
  subscription slotsStatusUpdated($token: String) {
    slotsStatusUpdated(posToken: $token) {
      _id
      posToken
      code
      name
      option
      status
      isPreDates {
        dueDate
        _id
      }
    }
  }
`

const subscriptions = { slotsStatusUpdated }
export default subscriptions
