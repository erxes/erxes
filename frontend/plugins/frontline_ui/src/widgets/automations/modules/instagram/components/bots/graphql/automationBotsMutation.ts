import gql from 'graphql-tag';

const INSTAGRAM_BOT_PARAMS = `
  $name: String,
  $accountId: String,
  $pageId: String,
  $persistentMenus: [BotPersistentMenuInput],
  $greetText: String,
  $tag: String,
  $isEnabledBackBtn:Boolean,
  $backButtonText:String
`;

const INSTAGRAM_BOT_PARAMS_DEF = `
  name: $name,
  accountId: $accountId,
  pageId: $pageId,
  persistentMenus: $persistentMenus,
  greetText: $greetText
  tag: $tag
  isEnabledBackBtn: $isEnabledBackBtn,
  backButtonText:$backButtonText
`;

const ADD_INSTAGRAM_BOT = gql`
  mutation InstagramMessengerAddBot(${INSTAGRAM_BOT_PARAMS}) {
    instagramMessengerAddBot(${INSTAGRAM_BOT_PARAMS_DEF})
  }
`;

const UPDATE_INSTAGRAM_BOT = gql`
    mutation InstagramMessengerUpdateBot($_id: String,${INSTAGRAM_BOT_PARAMS}) {
      instagramMessengerUpdateBot(_id: $_id,${INSTAGRAM_BOT_PARAMS_DEF})
    }
`;

const REMOVE_INSTAGRAM_BOT = gql`
  mutation InstagramMessengerRemoveBot($_id: String) {
    instagramMessengerRemoveBot(_id: $_id)
  }
`;

const REPAIR_INSTAGRAM_BOT = gql`
  mutation InstagramMessengerRepairBot($_id: String) {
    instagramMessengerRepairBot(_id: $_id)
  }
`;

export {
  ADD_INSTAGRAM_BOT,
  UPDATE_INSTAGRAM_BOT,
  REMOVE_INSTAGRAM_BOT,
  REPAIR_INSTAGRAM_BOT,
};
