const automationSubscription = `
	subscription automationResponded($userId: String!) {
		automationResponded(userId: $userId) {
			content
			responseId
		}
	}
`;

export default { automationSubscription };
