const slotsStatusUpdated = `
  subscription slotsStatusUpdated {
    slotsStatusUpdated {
      _id
      code
      status
    }
  }
`
const subscriptions = { slotsStatusUpdated }
export default subscriptions