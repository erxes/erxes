const notificationSubscription = `
	subscription notificationInserted($subdomain: String, $userId: String) {
		notificationInserted(subdomain: $subdomain, userId: $userId) {
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
