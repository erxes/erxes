const params = `
    $name: String,
    $accountId: String,
    $pageId: String
`;

const paramsDef = `
    name: $name,
    accountId: $accountId,
    pageId: $pageId
`;

const addBot = `
    mutation FacebookMessengerAddBot(${params}) {
      facebookMessengerAddBot(${paramsDef})
    }
`;

const updateBot = `
    mutation FacebookMessengerUpdateBot($id: String,${params}) {
      facebookMessengerUpdateBot(_id: $id,${paramsDef})
    }
`;

const removeBot = `
    mutation FacebookMessengerRemoveBot($_id: String) {
      facebookMessengerRemoveBot(_id: $_id)
    }
`;

export default { addBot, updateBot, removeBot };
