const notificationSubscription = `
	subscription notificationInserted($userId: String) {
		notificationInserted(userId: $userId) {
			_id
		}
  }
`;

export default { notificationSubscription };
