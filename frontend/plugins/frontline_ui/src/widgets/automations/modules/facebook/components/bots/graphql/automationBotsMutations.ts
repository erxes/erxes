import gql from 'graphql-tag';

const FACEBOOK_BOT_PARAMS = `
  $name: String,
  $accountId: String,
  $pageId: String,
  $persistentMenus: [BotPersistentMenuInput],
  $greetText: String,
  $tag: String,
  $isEnabledBackBtn:Boolean,
  $backButtonText:String
`;

const FACEBOOK_BOT_PARAMS_DEF = `
  name: $name,
  accountId: $accountId,
  pageId: $pageId,
  persistentMenus: $persistentMenus,
  greetText: $greetText
  tag: $tag
  isEnabledBackBtn: $isEnabledBackBtn,
  backButtonText:$backButtonText
`;

const ADD_FACEBOOK_BOT = gql`
  mutation FacebookMessengerAddBot(${FACEBOOK_BOT_PARAMS}) {
    facebookMessengerAddBot(${FACEBOOK_BOT_PARAMS_DEF})
  }
`;

const UPDATE_FACEBOOK_BOT = gql`
    mutation FacebookMessengerUpdateBot($_id: String,${FACEBOOK_BOT_PARAMS}) {
      facebookMessengerUpdateBot(_id: $_id,${FACEBOOK_BOT_PARAMS_DEF})
    }
`;

const REMOVE_FACEBOOK_BOT = gql`
  mutation FacebookMessengerRemoveBot($_id: String) {
    facebookMessengerRemoveBot(_id: $_id)
  }
`;

const REPAIR_FACEBOOK_BOT = gql`
  mutation FacebookMessengerRepairBot($_id: String) {
    facebookMessengerRepairBot(_id: $_id)
  }
`;

export {
  ADD_FACEBOOK_BOT,
  UPDATE_FACEBOOK_BOT,
  REMOVE_FACEBOOK_BOT,
  REPAIR_FACEBOOK_BOT,
};
