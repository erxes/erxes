const INSTAGRAM_BOT_FIELDS = `
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

const INSTAGRAM_BOTS = `
    query InstagramMessengerBots {
      instagramMessengerBots {
      ${INSTAGRAM_BOT_FIELDS}
      }
    }
`;

const INSTAGRAM_BOTS_TOTAL_COUNT = `
    query InstagramMessengerBotsTotalCount {
      instagramMessengerBotsTotalCount
    }
`;

const INSTAGRAM_BOT_DETAIL = `
    query InstagramMessengerBot($_id:String) {
      instagramMessengerBot(_id:$_id) {
        ${INSTAGRAM_BOT_FIELDS}
        greetText
        tag
        isEnabledBackBtn
        backButtonText
      }
    }
`;

const GET_INSTAGRAM_BOT_POSTS = `
  query InstagramGetBotPosts($botId: String) {
    instagramGetBotPosts(botId: $botId)
  }
`;

const GET_INSTAGRAM_BOT_POST = `
  query InstagramGetBotPost($botId: String,$postId: String) {
    instagramGetBotPost(botId: $botId,postId: $postId)
  }
`;

export default {
  INSTAGRAM_BOTS,
  INSTAGRAM_BOTS_TOTAL_COUNT,
  INSTAGRAM_BOT_DETAIL,
  GET_INSTAGRAM_BOT_POSTS,
  GET_INSTAGRAM_BOT_POST,
};
