const notificationsChanged = `
  subscription notificationsChanged($ids: [String]) {
    notificationsChanged(ids: $ids)
  }
`;

export default {
  notificationsChanged
};
