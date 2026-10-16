import { gql } from '~/gql';

export const ADD_INSTAGRAM_BOT = gql(`
  mutation InstagramMessengerAddBot(
    $name: String
    $accountId: String
    $pageId: String
    $persistentMenus: [InstagramBotPersistentMenuInput]
    $greetText: String
    $tag: String
    $isEnabledBackBtn: Boolean
    $backButtonText: String
  ) {
    instagramMessengerAddBot(
      name: $name
      accountId: $accountId
      pageId: $pageId
      persistentMenus: $persistentMenus
      greetText: $greetText
      tag: $tag
      isEnabledBackBtn: $isEnabledBackBtn
      backButtonText: $backButtonText
    )
  }
`);

export const UPDATE_INSTAGRAM_BOT = gql(`
  mutation InstagramMessengerUpdateBot(
    $_id: String
    $name: String
    $accountId: String
    $pageId: String
    $persistentMenus: [InstagramBotPersistentMenuInput]
    $greetText: String
    $tag: String
    $isEnabledBackBtn: Boolean
    $backButtonText: String
  ) {
    instagramMessengerUpdateBot(
      _id: $_id
      name: $name
      accountId: $accountId
      pageId: $pageId
      persistentMenus: $persistentMenus
      greetText: $greetText
      tag: $tag
      isEnabledBackBtn: $isEnabledBackBtn
      backButtonText: $backButtonText
    )
  }
`);

export const REMOVE_INSTAGRAM_BOT = gql(`
  mutation InstagramMessengerRemoveBot($_id: String) {
    instagramMessengerRemoveBot(_id: $_id)
  }
`);

export const REPAIR_INSTAGRAM_BOT = gql(`
  mutation InstagramMessengerRepairBot($_id: String) {
    instagramMessengerRepairBot(_id: $_id)
  }
`);
