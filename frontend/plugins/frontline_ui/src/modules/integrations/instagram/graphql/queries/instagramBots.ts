import gql from 'graphql-tag';

export const INSTAGRAM_BOTS_LIST = gql`
  query InstagramMessengerBots {
    instagramMessengerBots {
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
    }
  }
`;

export const INSTAGRAM_BOTS_TOTAL_COUNT = gql`
  query InstagramMessengerBotsTotalCount {
    instagramMessengerBotsTotalCount
  }
`;

export const INSTAGRAM_BOT_DETAIL = gql`
  query InstagramMessengerBot($_id: String) {
    instagramMessengerBot(_id: $_id) {
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
      greetText
      tag
      isEnabledBackBtn
      backButtonText
    }
  }
`;

export const GET_INSTAGRAM_BOT_PROFILE = gql`
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
`;

export const INSTAGRAM_GET_BOT_POSTS = gql`
  query InstagramGetBotPosts($botId: String) {
    instagramGetBotPosts(botId: $botId)
  }
`;

export const INSTAGRAM_GET_BOT_POST = gql`
  query InstagramGetBotPost($botId: String, $postId: String) {
    instagramGetBotPost(botId: $botId, postId: $postId)
  }
`;
