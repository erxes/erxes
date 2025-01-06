const params = `
  $name: String,
  $accountId: String,
  $whatsappNumberIds: [String!]
  $persistentMenus: [BotPersistentMenuInput],
  $greetText: String,
  $tag: String,
  $isEnabledBackBtn:Boolean,
  $backButtonText:String
`;

const paramsDef = `
  name: $name,
  accountId: $accountId,
  whatsappNumberIds: $whatsappNumberIds,
  persistentMenus: $persistentMenus,
  greetText: $greetText
  tag: $tag
  isEnabledBackBtn: $isEnabledBackBtn,
  backButtonText:$backButtonText
`;

const addBot = `
  mutation WhatsappMessengerAddBot(${params}) {
    whatsappMessengerAddBot(${paramsDef})
  }
`;

const updateBot = `
    mutation WhatsappMessengerUpdateBot($_id: String,${params}) {
      whatsappMessengerUpdateBot(_id: $_id,${paramsDef})
    }
`;

const removeBot = `
    mutation WhatsappMessengerRemoveBot($_id: String) {
      whatsappMessengerRemoveBot(_id: $_id)
    }
`;

const repairBot = `
  mutation WhatsappMessengerRepairBot($_id: String) {
    whatsappMessengerRepairBot(_id: $_id)
  }
`;

export default { addBot, updateBot, removeBot, repairBot };
