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
  mutation NotificationsSaveConfig(
    $_id: String,
    $userId: String,
    $isDisabled: Boolean,
    $isAllowEmail: Boolean,
    $isDefault: Boolean,
    $isAllowedDesktop: Boolean,
    $pluginsConfigs:[IPluginConfig]
  ) {
    notificationsSaveConfig(
      _id:$_id,
      userId:$userId,
      isDisabled:$isDisabled,
      isAllowEmail:$isAllowEmail,
      isAllowedDesktop:$isAllowedDesktop,
      isDefault: $isDefault,
      pluginsConfigs:$pluginsConfigs
    ) {
      _id
    }
  }
`;

const saveAsDefaultNotificationsConfigs = `
  mutation NotificationsSetAsDefaultConfig {
    notificationsSetAsDefaultConfig
  }
`;

export default {
  markAsRead,
  showNotification,
  configGetNotificationByEmail,
  saveNotificationConfigurations,
  saveAsDefaultNotificationsConfigs
};
