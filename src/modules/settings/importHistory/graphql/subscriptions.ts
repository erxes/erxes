const importSubscription = `
	subscription importHistoryChanged($_id: String!) {
		importHistoryChanged(_id: $_id) {
			_id
			status
			percentage
		}
  }
`;

export default { importSubscription };
