import gql from 'graphql-tag';

const FACEBOOK_BOT_FIELDS = `
  _id
  name
  account
  accountId
  createdAt
  page
  pageId
  profileUrl
  persistentMenus {
    _id,text,type,link
  }
`;

export const FACEBOOK_BOTS_LIST = gql`
    query FacebookMessengerBots {
      facebookMessengerBots {
        ${FACEBOOK_BOT_FIELDS}
      }
    }
`;

export const FACEBOOK_BOTS_TOTAL_COUNT = gql`
  query FacebookMessengerBotsTotalCount {
    facebookMessengerBotsTotalCount
  }
`;

export const FACEBOOK_BOT_DETAIL = gql`
    query FacebootMessengerBot($_id:String) {
      facebookMessengerBot(_id:$_id) {
        ${FACEBOOK_BOT_FIELDS}
        greetText
        tag
        isEnabledBackBtn
        backButtonText
      }
    }
`;

export const GET_FACEBOOK_BOT_PROFILE = gql`
  query FacebootMessengerBot($_id: String) {
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
    }
  }
`;

export const FACEBOOK_GET_BOT_POSTS = gql`
  query FacebookGetBotPosts($botId: String) {
    facebookGetBotPosts(botId: $botId)
  }
`;

export const FACEBOOK_GET_BOT_POST = gql`
  query FacebookGetBotPost($botId: String, $postId: String) {
    facebookGetBotPost(botId: $botId, postId: $postId)
  }
`;
