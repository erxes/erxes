export const commonFields = `
  _id
  name
  url
  description
  logo
  icon
  domain
  dnsStatus
  knowledgeBaseLabel
  knowledgeBaseTopicId
  ticketLabel
  taskPublicPipelineId
  taskPublicBoardId
  taskLabel
  taskStageId
  taskPipelineId
  taskBoardId
  ticketStageId
  ticketPipelineId
  ticketBoardId
  styles {
    bodyColor
    headerColor
    footerColor
    helpColor
    backgroundColor
    activeTabColor
    baseColor
    headingColor
    linkColor
    linkHoverColor
    baseFont
    headingFont
    dividerColor
    primaryBtnColor
    secondaryBtnColor
  }
  mobileResponsive
  googleCredentials
  twilioAccountSid
  twilioAuthToken
  twilioFromNumber
`;

const getTotalCount = `
  query clientPortalConfigsTotalCount {
    clientPortalConfigsTotalCount
  }
`;

const getConfigs = `
  query clientPortalGetConfigs($page: Int, $perPage: Int) {
    clientPortalGetConfigs(page: $page, perPage: $perPage) {
      ${commonFields}
    }
  }
`;

const getConfig = `
  query clientPortalGetConfig($_id: String!) {
    clientPortalGetConfig(_id: $_id) {
      ${commonFields}
    }
  }
`;

const getConfigLast = `
  query clientPortalGetLast {
    clientPortalGetLast {
      ${commonFields}
    }
  }
`;

export default { getConfig, getConfigs, getTotalCount, getConfigLast };
