const currentUser = `
  query currentUser {
    clientPortalCurrentUser {
      _id
      email
      phone
      firstName
      lastName

      notificationSettings {
        configs {
          isAllowed
          label
          notifType
        }
        receiveByEmail
        receiveBySms
      }
    }
  }
`;

const notificationsCountQuery = `
  query clientPortalNotificationCount {
    clientPortalNotificationCount
  }
`;

const notificationsQuery = `
  query ClientPortalNotifications(
    $endDate: String
    $limit: Int
    $notifType: NotificationType
    $page: Int
    $perPage: Int
    $requireRead: Boolean
    $search: String
    $startDate: String
  ) {
    clientPortalNotifications(
      endDate: $endDate
      limit: $limit
      notifType: $notifType
      page: $page
      perPage: $perPage
      requireRead: $requireRead
      search: $search
      startDate: $startDate
    ) {
      _id
      createdAt
      isRead
      title
    }
  }
`;

export default { currentUser, notificationsCountQuery, notificationsQuery };
