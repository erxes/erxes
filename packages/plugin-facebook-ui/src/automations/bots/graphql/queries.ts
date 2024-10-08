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
    query FacebootMessengerBots {
      facebootMessengerBots {
      ${fields}
      }
    }
`;

const totalCount = `
    query FacebootMessengerBotsTotalCount {
      facebootMessengerBotsTotalCount
    }
`;

const detail = `
    query FacebootMessengerBot($_id:String) {
      facebootMessengerBot(_id:$_id) {
        ${fields}
        greetText
        tag
        isEnabledBackBtn
        backButtonText
      }
    }
`;

const getPosts = `
  query FacebookGetBotPosts($botId: String) {
    facebookGetBotPosts(botId: $botId)
  }
`;

const getPost = `
  query FacebookGetBotPost($botId: String,$postId: String) {
    facebookGetBotPost(botId: $botId,postId: $postId)
  }
`;

export default {
  list,
  totalCount,
  detail,
  getPosts,
  getPost,
};
