const list = `
    query FacebootMessengerBots {
      facebootMessengerBots {
        _id
        name
        account
        accountId
        createdAt
        page
        pageId
        persistentMenus {
          _id,title,type,url
        }
      }
    }
`;

const totalCount = `
    query FacebootMessengerBotsTotalCount {
      facebootMessengerBotsTotalCount
    }
`;

export default {
  list,
  totalCount
};
