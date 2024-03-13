const multierkhetSubscription = `
	subscription multierkhetResponded($userId: String, $sessionCode: String) {
		multierkhetResponded(userId: $userId, sessionCode: $sessionCode) {
			content
			responseId
			userId
			sessionCode
		}
	}
`;

export default { multierkhetSubscription };
