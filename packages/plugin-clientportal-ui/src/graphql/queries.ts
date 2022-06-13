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
  clientPortalId

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
  $segment: String,
  $tag: String,
  $type: String,
  $ids: [String],
  $excludeIds: Boolean,
  $searchValue: String,
  $autoCompletionType: String,
  $autoCompletion: Boolean,
  $brand: String,
  $integration: String,
  $form: String,
  $startDate: String,
  $endDate: String,
  $leadStatus: String,
  $sortField: String,
  $sortDirection: Int,
  ${conformityQueryFields}
`;

export const listParamsValue = `
  page: $page,
  perPage: $perPage,
  segment: $segment,
  tag: $tag,
  type: $type,
  ids: $ids,
  excludeIds: $excludeIds,
  autoCompletionType: $autoCompletionType,
  autoCompletion: $autoCompletion,
  searchValue: $searchValue,
  brand: $brand,
  integration: $integration
  form: $form,
  startDate: $startDate,
  endDate: $endDate,
  leadStatus: $leadStatus,
  sortField: $sortField,
  sortDirection: $sortDirection,
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
  query clientPortalUserCounts(${listParamsDef}, $only: String) {
    clientPortalUserCounts(${listParamsValue}, only: $only)
  }
`;

export default {
  getConfig,
  getConfigs,
  getTotalCount,
  getConfigLast,
  clientPortalUsers,
  clientPortalUsersMain,
  clientPortalUserCounts
};
