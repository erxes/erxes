import {
  conformityQueryFieldDefs,
  conformityQueryFields
} from '@erxes/ui-cards/src/conformity/graphql/queries';

export const commonFields = `
  _id
  name
  url
  description
  logo
  icon
  headerHtml,
  footerHtml,
  domain
  dnsStatus
  messengerBrandCode
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

  kbToggle
  publicTaskToggle
  ticketToggle
  taskToggle
  otpConfig {
    smsTransporterType
    emailTransporterType
    content
    codeLength
  }
`;

export const basicFields = `
  _id
  firstName
  lastName
  username
  code
  email
  phone
  companyName
  companyRegistrationNumber
  clientPortalId
  type

  clientPortal {
    name
  }

  erxesCustomerId
  erxesCompanyId

  modifiedAt
  ownerId
`;

export const clientPortalUserFields = `
  ${basicFields}
  createdAt

  customFieldsData
`;

export const listParamsDef = `
  $page: Int,
  $perPage: Int,
  $type: String,
  $ids: [String],
  $excludeIds: Boolean,
  $searchValue: String,
  $sortField: String,
  $sortDirection: Int,
  $cpId: String,
  ${conformityQueryFields}
`;

export const listParamsValue = `
  page: $page,
  perPage: $perPage,
  type: $type,
  ids: $ids,
  excludeIds: $excludeIds,
  searchValue: $searchValue,
  sortField: $sortField,
  sortDirection: $sortDirection,
  cpId: $cpId,
  ${conformityQueryFieldDefs}
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

const clientPortalUsers = `
  query clientPortalUsers(${listParamsDef}) {
    clientPortalUsers(${listParamsValue}) {
      ${clientPortalUserFields}
    }
  }
`;

const clientPortalUsersMain = `
  query clientPortalUsersMain(${listParamsDef}) {
    clientPortalUsersMain(${listParamsValue}) {
      list {
        ${clientPortalUserFields}
      }

      totalCount
    }
  }
`;

const clientPortalUserCounts = `
  query clientPortalUserCounts {
    clientPortalUserCounts
  }
`;

const clientPortalUserDetail = `
  query clientPortalUserDetail($_id: String!) {
    clientPortalUserDetail(_id: $_id) {
      ${clientPortalUserFields}
    }
  }
`;

export default {
  getConfig,
  getConfigs,
  getTotalCount,
  getConfigLast,
  clientPortalUsers,
  clientPortalUsersMain,
  clientPortalUserDetail,
  clientPortalUserCounts
};
