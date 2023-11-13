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
