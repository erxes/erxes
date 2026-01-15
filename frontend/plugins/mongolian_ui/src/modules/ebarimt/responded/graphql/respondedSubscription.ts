const ebarimtSubscription = `
	subscription ebarimtResponded($userId: String, $processId: String) {
		ebarimtResponded(userId: $userId, processId: $processId) {
			content
			responseId
			userId
			processId
		}
	}
`;

export default { ebarimtSubscription };
