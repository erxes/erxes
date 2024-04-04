const notificationSubscription = `
	subscription clientPortalNotificationInserted($userId: String) {
		clientPortalNotificationInserted(userId: $userId) {
			_id
			title
			content
		}
  	}
`;

const notificationRead = `
	subscription clientPortalNotificationRead($userId: String) {
		clientPortalNotificationRead(userId: $userId)
  	}
`;

export default { notificationSubscription, notificationRead };
