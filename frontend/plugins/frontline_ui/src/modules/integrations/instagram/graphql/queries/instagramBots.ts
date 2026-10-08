import { gql } from '~/gql';

export const INSTAGRAM_BOTS_LIST = gql(`
  query InstagramMessengerBots {
    instagramMessengerBots {
      _id
      name
      account {
        _id
        name
      }
      accountId
      createdAt
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
    }
  }
`);

export const INSTAGRAM_BOTS_TOTAL_COUNT = gql(`
  query InstagramMessengerBotsTotalCount {
    instagramMessengerBotsTotalCount
  }
`);

export const INSTAGRAM_BOT_DETAIL = gql(`
  query InstagramMessengerBot($_id: String) {
    instagramMessengerBot(_id: $_id) {
      _id
      name
      account {
        _id
        name
      }
      accountId
      createdAt
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
      greetText
      tag
      isEnabledBackBtn
      backButtonText
    }
  }
`);

export const GET_INSTAGRAM_BOT_PROFILE = gql(`
  query InstagramMessengerBotProfile($_id: String) {
    instagramMessengerBot(_id: $_id) {
      _id
      name
      profileUrl
      persistentMenus {
        _id
        text
        type
        link
      }
    }
  }
`);

export const INSTAGRAM_GET_BOT_POSTS = gql(`
  query InstagramGetBotPosts($botId: String) {
    instagramGetBotPosts(botId: $botId) {
      id
      message
      created_time
      picture
      full_picture
      permalink_url
    }
  }
`);

export const INSTAGRAM_GET_BOT_POST = gql(`
  query InstagramGetBotPost($botId: String, $postId: String) {
    instagramGetBotPost(botId: $botId, postId: $postId) {
      id
      message
      created_time
      picture
      full_picture
      permalink_url
    }
  }
`);
