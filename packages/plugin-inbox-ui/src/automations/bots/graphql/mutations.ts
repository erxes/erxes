const params = `
  $name: String,
  $accountId: String,
  $widgetsNumberIds: [String!]
  $persistentMenus: [BotPersistentMenuInput],
  $greetText: String,
  $tag: String,
  $isEnabledBackBtn:Boolean,
  $backButtonText:String
`;

const paramsDef = `
  name: $name,
  accountId: $accountId,
  widgetsNumberIds: $widgetsNumberIds,
  persistentMenus: $persistentMenus,
  greetText: $greetText
  tag: $tag
  isEnabledBackBtn: $isEnabledBackBtn,
  backButtonText:$backButtonText
`;

const addBot = `
  mutation WidgetsMessengerAddBot(${params}) {
    widgetsMessengerAddBot(${paramsDef})
  }
`;

const updateBot = `
    mutation WidgetsMessengerUpdateBot($_id: String,${params}) {
      widgetsMessengerUpdateBot(_id: $_id,${paramsDef})
    }
`;

const removeBot = `
    mutation WidgetsMessengerRemoveBot($_id: String) {
      widgetsMessengerRemoveBot(_id: $_id)
    }
`;

const repairBot = `
  mutation WidgetsMessengerRepairBot($_id: String) {
    widgetsMessengerRepairBot(_id: $_id)
  }
`;

export default { addBot, updateBot, removeBot, repairBot };
