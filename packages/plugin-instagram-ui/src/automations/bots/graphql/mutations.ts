const params = `
  $name: String,
  $accountId: String,
  $pageId: String,
  $persistentMenus: [BotPersistentMenuInput],
  $greetText: String,
  $tag: String,
  $isEnabledBackBtn:Boolean,
  $backButtonText:String
`;

const paramsDef = `
  name: $name,
  accountId: $accountId,
  pageId: $pageId,
  persistentMenus: $persistentMenus,
  greetText: $greetText
  tag: $tag
  isEnabledBackBtn: $isEnabledBackBtn,
  backButtonText:$backButtonText
`;

const addBot = `
  mutation InstagramMessengerAddBot(${params}) {
    instagramMessengerAddBot(${paramsDef})
  }
`;

const updateBot = `
    mutation InstagramMessengerUpdateBot($_id: String,${params}) {
      instagramMessengerUpdateBot(_id: $_id,${paramsDef})
    }
`;

const removeBot = `
    mutation InstagramMessengerRemoveBot($_id: String) {
      instagramMessengerRemoveBot(_id: $_id)
    }
`;

const repairBot = `
  mutation InstagramMessengerRepairBot($_id: String) {
    instagramMessengerRepairBot(_id: $_id)
  }
`;

export default { addBot, updateBot, removeBot, repairBot };
