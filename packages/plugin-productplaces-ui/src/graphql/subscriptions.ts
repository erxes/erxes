const productPlacesSubscription = `
	subscription productPlacesResponded($userId: String, $sessionCode: String) {
		productPlacesResponded(userId: $userId, sessionCode: $sessionCode) {
			content
			responseId
			userId
			sessionCode
		}
	}
`;

export default { productPlacesSubscription };
