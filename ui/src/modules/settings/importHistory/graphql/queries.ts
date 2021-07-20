const histories = `
  query importHistories($type: String!, $perPage: Int, $page: Int) {
    importHistories(type: $type, perPage: $perPage, page: $page) {
      list {
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
      count 
    }
  }
`;

const allLeadIntegrations = `
  query allLeadIntegrations {
    allLeadIntegrations {
      _id
      name
      formId
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
      contentType
    }
  }
`;

export default {
  allLeadIntegrations,
  histories,
  historyDetail,
  historyDetailForLoad
};
