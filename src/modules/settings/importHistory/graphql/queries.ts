const histories = `
  query importHistories($type: String!, $perPage: Int, $page: Int) {
    importHistories(type: $type, perPage: $perPage, page: $page) {
      _id
      success
      failed
      total
      contentType
      date
      user {
        details {
          fullName
        }
      }
    }
  }
`;

const historyDetail = `
  query importHistoryDetail($_id: String!) {
    importHistoryDetail(_id: $_id) {
      _id
      success
      failed
      total
      contentType
      date
      errorMsgs
      percentage
      status
    }
  }
`;

const historyDetailForLoad = `
  query importHistoryDetail($_id: String!) {
    importHistoryDetail(_id: $_id) {
      _id
      errorMsgs
      percentage
      status
    }
  }
`;

export default {
  histories,
  historyDetail,
  historyDetailForLoad
};
