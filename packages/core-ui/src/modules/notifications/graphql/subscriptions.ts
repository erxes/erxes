const notificationSubscription = `
	subscription notificationInserted($userId: String) {
		notificationInserted(userId: $userId) {
			_id
			title
			content
		}
  }
`;

const notificationRead = `
	subscription notificationRead($userId: String) {
		notificationRead(userId: $userId)
  }
`;

export default { notificationSubscription, notificationRead };
