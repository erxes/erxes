import gql from 'graphql-tag';

const ADD_FACEBOOK_BOT = gql`
  mutation FacebookMessengerAddBot(
    $name: String
    $accountId: String
    $pageId: String
    $persistentMenus: [BotPersistentMenuInput]
    $iceBreakers: [BotIceBreakerInput]
    $getStartedText: String
    $greetText: String
    $handoffMessage: String
    $automationActiveMessage: String
    $handoffPauseMinutes: Int
    $tag: String
    $isEnabledBackBtn: Boolean
    $backButtonText: String
  ) {
    facebookMessengerAddBot(
      name: $name
      accountId: $accountId
      pageId: $pageId
      persistentMenus: $persistentMenus
      iceBreakers: $iceBreakers
      getStartedText: $getStartedText
      greetText: $greetText
      handoffMessage: $handoffMessage
      automationActiveMessage: $automationActiveMessage
      handoffPauseMinutes: $handoffPauseMinutes
      tag: $tag
      isEnabledBackBtn: $isEnabledBackBtn
      backButtonText: $backButtonText
    ) {
      _id
      name
      account
      accountId
      createdAt
      page
      pageId
      profileUrl
      persistentMenus {
        _id
        text
        type
        link
      }
      iceBreakers {
        _id
        question
      }
      getStartedText
      greetText
      handoffMessage
      automationActiveMessage
      handoffPauseMinutes
      tag
      isEnabledBackBtn
      backButtonText
      health {
        status
        isSubscribed
        isProfileSynced
        lastSyncedAt
        lastVerifiedAt
      }
    }
  }
`;

const UPDATE_FACEBOOK_BOT = gql`
  mutation FacebookMessengerUpdateBot(
    $_id: String
    $name: String
    $accountId: String
    $pageId: String
    $persistentMenus: [BotPersistentMenuInput]
    $iceBreakers: [BotIceBreakerInput]
    $getStartedText: String
    $greetText: String
    $handoffMessage: String
    $automationActiveMessage: String
    $handoffPauseMinutes: Int
    $tag: String
    $isEnabledBackBtn: Boolean
    $backButtonText: String
  ) {
    facebookMessengerUpdateBot(
      _id: $_id
      name: $name
      accountId: $accountId
      pageId: $pageId
      persistentMenus: $persistentMenus
      iceBreakers: $iceBreakers
      getStartedText: $getStartedText
      greetText: $greetText
      handoffMessage: $handoffMessage
      automationActiveMessage: $automationActiveMessage
      handoffPauseMinutes: $handoffPauseMinutes
      tag: $tag
      isEnabledBackBtn: $isEnabledBackBtn
      backButtonText: $backButtonText
    ) {
      _id
      name
      account
      accountId
      createdAt
      page
      pageId
      profileUrl
      persistentMenus {
        _id
        text
        type
        link
      }
      iceBreakers {
        _id
        question
      }
      getStartedText
      greetText
      handoffMessage
      automationActiveMessage
      handoffPauseMinutes
      tag
      isEnabledBackBtn
      backButtonText
      health {
        status
        isSubscribed
        isProfileSynced
        lastSyncedAt
        lastVerifiedAt
      }
    }
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
