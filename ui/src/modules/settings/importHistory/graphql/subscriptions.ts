const importSubscription = `
	subscription importHistoryChanged($_id: String!) {
		importHistoryChanged(_id: $_id) {
			_id
			status
			percentage
			errorMsgs
		}
  }
`;

export default { importSubscription };
