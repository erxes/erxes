const commonFields = `
  _id
  name
  url
  description
  logo
  icon
  knowledgeBaseLabel
  knowledgeBaseTopicId
  ticketLabel
  taskLabel
  taskStageId
  taskPipelineId
  taskBoardId
  ticketStageId
  ticketPipelineId
  ticketBoardId
`;

const getTotalCount = `
  query getClientPortalTotalCount {
    getClientPortalTotalCount
  }
`;

const getConfigs = `
  query getConfigs($page: Int, $perPage: Int) {
    getConfigs(page: $page, perPage: $perPage) {
      ${commonFields}
    }
  }
`;

const getConfig = `
  query getConfig($_id: String!) {
    getConfig(_id: $_id) {
      ${commonFields}
    }
  }
`;

export default { getConfig, getConfigs, getTotalCount };
