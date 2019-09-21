const markAsRead = `
  mutation notificationsMarkAsRead( $_ids: [String], $contentTypeId: String) {
    notificationsMarkAsRead(_ids: $_ids, contentTypeId: $contentTypeId)
  }
`;

export default {
  markAsRead
};
