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

const FACEBOOK_BOTS = `
    query FacebootMessengerBots {
      facebootMessengerBots {
      ${FACEBOOK_BOT_FIELDS}
      }
    }
`;

const FACEBOOK_BOTS_TOTAL_COUNT = `
    query FacebootMessengerBotsTotalCount {
      facebootMessengerBotsTotalCount
    }
`;

const FACEBOOK_BOT_DETAIL = `
    query FacebootMessengerBot($_id:String) {
      facebootMessengerBot(_id:$_id) {
        ${FACEBOOK_BOT_FIELDS}
        greetText
        tag
        isEnabledBackBtn
        backButtonText
      }
    }
`;

const GET_FACEBOOK_BOT_POSTS = `
  query FacebookGetBotPosts($botId: String) {
    facebookGetBotPosts(botId: $botId)
  }
`;

const GET_FACEBOOK_BOT_POST = `
  query FacebookGetBotPost($botId: String,$postId: String) {
    facebookGetBotPost(botId: $botId,postId: $postId)
  }
`;

export default {
  FACEBOOK_BOTS,
  FACEBOOK_BOTS_TOTAL_COUNT,
  FACEBOOK_BOT_DETAIL,
  GET_FACEBOOK_BOT_POSTS,
  GET_FACEBOOK_BOT_POST,
};
