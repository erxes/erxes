import { gql } from '~/gql';

export const FACEBOOK_BOT_LIST_FIELDS = gql(`
  fragment FacebookMessengerBotListFields on FacebookMessengerBot {
    _id
    name
    account {
      _id
      name
    }
    accountId
    createdAt
    updatedAt
    createdBy
    updatedBy
    createdUser {
      _id
      username
      email
      details {
        fullName
        avatar
      }
    }
    updatedUser {
      _id
      username
      email
      details {
        fullName
        avatar
      }
    }
    page {
      id
      name
    }
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
    health {
      status
      isSubscribed
      isProfileSynced
      lastSyncedAt
      lastVerifiedAt
      lastError
      sendBlockedUntil
      sendBlockReason
      sendBlockCount
    }
  }
`);

export const FACEBOOK_BOTS_LIST = gql(`
  query FacebookMessengerBots {
    facebookMessengerBots {
      ...FacebookMessengerBotListFields
    }
  }
`);

export const FACEBOOK_BOTS_TOTAL_COUNT = gql(`
  query FacebookMessengerBotsTotalCount {
    facebookMessengerBotsTotalCount
  }
`);

export const FACEBOOK_BOT_DETAIL = gql(`
  query FacebootMessengerBot($_id: String) {
    facebookMessengerBot(_id: $_id) {
      _id
      name
      account {
        _id
        name
      }
      accountId
      createdAt
      updatedAt
      createdBy
      updatedBy
      createdUser {
        _id
        username
        email
        details {
          fullName
          avatar
        }
      }
      updatedUser {
        _id
        username
        email
        details {
          fullName
          avatar
        }
      }
      page {
        id
        name
      }
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
      health {
        status
        isSubscribed
        isProfileSynced
        lastSyncedAt
        lastVerifiedAt
        lastError
        sendBlockedUntil
        sendBlockReason
        sendBlockCount
      }
      greetText
      handoffMessage
      automationActiveMessage
      handoffPauseMinutes
      tag
      isEnabledBackBtn
      backButtonText
    }
  }
`);

export const GET_FACEBOOK_BOT_PROFILE = gql(`
  query FacebookMessengerBotProfile($_id: String) {
    facebookMessengerBot(_id: $_id) {
      _id
      name
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
    }
  }
`);

export const FACEBOOK_BOT_HEALTH_NOTIFICATION_DETAIL = gql(`
  query FacebookBotHealthNotificationDetail($_id: String) {
    facebookMessengerBot(_id: $_id) {
      _id
      name
      page {
        id
        name
      }
      pageId
    }
  }
`);

export const FACEBOOK_GET_BOT_POSTS = gql(`
  query FacebookGetBotPosts($botId: String) {
    facebookGetBotPosts(botId: $botId) {
      id
      message
      created_time
      picture
      full_picture
      permalink_url
    }
  }
`);

export const FACEBOOK_GET_BOT_POST = gql(`
  query FacebookGetBotPost($botId: String, $postId: String) {
    facebookGetBotPost(botId: $botId, postId: $postId) {
      id
      message
      created_time
      picture
      full_picture
      permalink_url
    }
  }
`);

export const FACEBOOK_BOT_DELIVERY = gql(`
  query FacebookMessengerBotDelivery($_id: String!) {
    facebookMessengerBotDelivery(_id: $_id) {
      pending
      sent
      failed
      nextSendAt
    }
  }
`);

export const FACEBOOK_BOT_COMMENT_REPLY_STATS = gql(`
  query FacebookMessengerBotCommentReplyStats($_id: String!, $limit: Int) {
    facebookMessengerBotCommentReplyStats(_id: $_id, limit: $limit) {
      text
      total
      sent
      failed
      pending
      postCount
      posts {
        postId
        count
        content
        permalinkUrl
      }
      lastAt
      lastError
    }
  }
`);
