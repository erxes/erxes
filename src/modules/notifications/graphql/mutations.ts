const markAsRead = `
  mutation notificationsMarkAsRead( $_ids: [String]) {
    notificationsMarkAsRead(_ids: $_ids)
  }
`;

export default {
  markAsRead
};
