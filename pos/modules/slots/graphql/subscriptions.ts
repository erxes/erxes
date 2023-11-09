const slotsStatusUpdated = `
  subscription slotsStatusUpdated {
    slotsStatusUpdated {
      _id
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
`;

const subscriptions = { slotsStatusUpdated };
export default subscriptions;
