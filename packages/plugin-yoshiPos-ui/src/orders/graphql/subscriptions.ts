const ordersOrdered = `
  subscription ordersOrdered($statuses: [String]) {
    ordersOrdered(statuses: $statuses) {
      _id
    }
  }
`;

export default {
  ordersOrdered
};
