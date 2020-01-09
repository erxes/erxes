const automationSubscription = `
	subscription automationResponded($userId: String) {
		automationResponsed(userId: $userId) {
			_id
			response
		}
  }
`;

export default { automationSubscription };
