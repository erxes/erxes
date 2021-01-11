const automationSubscription = `
	subscription automationResponded($userId: String, $sessionCode: String) {
		automationResponded(userId: $userId, sessionCode: $sessionCode) {
			content
			responseId
			userId
			sessionCode
		}
	}
`;

export default { automationSubscription };
