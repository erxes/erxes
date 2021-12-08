const histories = `
  query importHistories($type: String!, $perPage: Int, $page: Int) {
    importHistories(type: $type, perPage: $perPage, page: $page) {
      list {
        _id
        success
        failed
        total
        contentTypes
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
      contentTypes
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
      contentTypes
    }
  }
`;

export default {
  allLeadIntegrations,
  histories,
  historyDetail,
  historyDetailForLoad
};
