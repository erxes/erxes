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

const configGetNotificationByEmail = `
  mutation UsersConfigGetNotificationByEmail($isAllowed: Boolean) {
    usersConfigGetNotificationByEmail(isAllowed: $isAllowed) {
      _id
    }
  }
`;

const saveNotificationConfigurations = `
  mutation NotificationsSaveConfig($notifType: String!, $isAllowed: Boolean) {
    notificationsSaveConfig(notifType: $notifType, isAllowed: $isAllowed) {
      _id
    }
  }
`;

export default {
  markAsRead,
  showNotification,
  configGetNotificationByEmail,
  saveNotificationConfigurations,
};
