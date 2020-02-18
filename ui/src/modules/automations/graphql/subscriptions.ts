const automationSubscription = `
	subscription automationResponded($userId: String!) {
		automationResponded(userId: $userId) {
			content
		}
	}
`;

export default { automationSubscription };
