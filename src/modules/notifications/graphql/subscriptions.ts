const notificationSubscription = `
	subscription notificationInserted($userId: String) {
		notificationInserted(userId: $userId)
  }
`;

export default { notificationSubscription };
