const notificationInserted = `
  subscription notificationInserted($_id: String!) {
    notificationInserted(_id: $_id) {
      _id
    }
  }
`;

export default {
  notificationInserted,
};
