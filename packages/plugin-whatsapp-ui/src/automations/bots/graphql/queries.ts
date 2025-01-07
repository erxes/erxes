const fields = `
  _id
  name
  account
  accountId
  createdAt
  page
  whatsappNumberIds
  profileUrl
  persistentMenus {
    _id,text,type,link
  }
`;

const list = `
    query WhatsappBootMessengerBots {
      whatsappBootMessengerBots {
      ${fields}
      }
    }
`;

const totalCount = `
    query WhatsappBootMessengerBotsTotalCount {
      whatsappBootMessengerBotsTotalCount
    }
`;

const detail = `
    query WhatsappBootMessengerBot($_id:String) {
      whatsappBootMessengerBot(_id:$_id) {
        ${fields}
        greetText
        tag
        isEnabledBackBtn
        backButtonText
      }
    }
`;

const getPosts = `
  query WhatsappGetBotPosts($botId: String) {
    whatsappGetBotPosts(botId: $botId)
  }
`;

const getPost = `
  query WhatsappGetBotPost($botId: String,$postId: String) {
    whatsappGetBotPost(botId: $botId,postId: $postId)
  }
`;

export default {
  list,
  totalCount,
  detail,
  getPosts,
  getPost
};
