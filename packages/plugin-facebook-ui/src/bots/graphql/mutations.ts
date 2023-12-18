const params = `
  $name: String,
  $accountId: String,
  $pageId: String,
  $persistentMenus: [BotPersistentMenuInput]
`;

const paramsDef = `
  name: $name,
  accountId: $accountId,
  pageId: $pageId,
  persistentMenus: $persistentMenus
`;

const addBot = `
  mutation FacebookMessengerAddBot(${params}) {
    facebookMessengerAddBot(${paramsDef})
  }
`;

const updateBot = `
    mutation FacebookMessengerUpdateBot($_id: String,${params}) {
      facebookMessengerUpdateBot(_id: $_id,${paramsDef})
    }
`;

const removeBot = `
    mutation FacebookMessengerRemoveBot($_id: String) {
      facebookMessengerRemoveBot(_id: $_id)
    }
`;

export default { addBot, updateBot, removeBot };
