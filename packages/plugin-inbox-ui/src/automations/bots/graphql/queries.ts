const fields = `
  _id
  name
  account
  accountId
  createdAt
  page
  widgetsNumberIds
  profileUrl
  persistentMenus {
    _id,text,type,link
  }
`;

const list = `
    query WidgetsBootMessengerBots {
      widgetsBootMessengerBots {
      ${fields}
      }
    }
`;

const totalCount = `
    query WidgetsBootMessengerBotsTotalCount {
      widgetsBootMessengerBotsTotalCount
    }
`;

const detail = `
    query WidgetsBootMessengerBot($_id:String) {
      widgetsBootMessengerBot(_id:$_id) {
        ${fields}
        greetText
        tag
        isEnabledBackBtn
        backButtonText
      }
    }
`;

const getPosts = `
  query WidgetsGetBotPosts($botId: String) {
    widgetsGetBotPosts(botId: $botId)
  }
`;

const getPost = `
  query WidgetsGetBotPost($botId: String,$postId: String) {
    widgetsGetBotPost(botId: $botId,postId: $postId)
  }
`;

export default {
  list,
  totalCount,
  detail,
  getPosts,
  getPost
};
