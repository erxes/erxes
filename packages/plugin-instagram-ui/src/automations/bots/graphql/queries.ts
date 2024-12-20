const fields = `
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

const list = `
    query IgbootMessengerBots {
      igbootMessengerBots {
      ${fields}
      }
    }
`;

const totalCount = `
    query IgbootMessengerBotsTotalCount {
      igbootMessengerBotsTotalCount
    }
`;

const detail = `
    query IgbootMessengerBot($_id:String) {
      igbootMessengerBot(_id:$_id) {
        ${fields}
        greetText
        tag
        isEnabledBackBtn
        backButtonText
      }
    }
`;

const getPosts = `
  query InstagramGetBotPosts($botId: String) {
    instagramGetBotPosts(botId: $botId)
  }
`;

const getPost = `
  query InstagramGetBotPost($botId: String,$postId: String) {
    instagramGetBotPost(botId: $botId,postId: $postId)
  }
`;

export default {
  list,
  totalCount,
  detail,
  getPosts,
  getPost,
};
