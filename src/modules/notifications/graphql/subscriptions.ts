const notificationSubscription = `
	subscription notificationInserted($userId: String) {
		notificationInserted(userId: $userId) {
			title
			content
		}
  }
`;

export default { notificationSubscription };
