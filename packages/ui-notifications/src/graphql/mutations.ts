const markAsRead = `
  mutation notificationsMarkAsRead( $_ids: [String], $contentTypeId: String) {
    notificationsMarkAsRead(_ids: $_ids, contentTypeId: $contentTypeId)
  }
`;

const showNotification = `
  mutation notificationsShow {
    notificationsShow
  }
`;

export default {
  markAsRead,
  showNotification
};
