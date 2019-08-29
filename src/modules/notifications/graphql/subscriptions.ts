const notificationSubscription = `
	subscription notificationInserted($userId: String) {
		notificationInserted(userId: $userId) {
			_id
			title
			content
		}
  }
`;

export default { notificationSubscription };
