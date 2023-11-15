import {
  conformityQueryFieldDefs,
  conformityQueryFields
} from '@erxes/ui-cards/src/conformity/graphql/queries';
import { isEnabled } from '@erxes/ui/src/utils/core';

export const commonFields = `
  _id
  name
  url
  kind
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
  dealLabel
  purchaseLabel
  taskPublicPipelineId
  taskPublicBoardId
  taskPublicLabel
  taskLabel
  taskStageId
  taskPipelineId
  taskBoardId
  ticketStageId
  ticketPipelineId
  ticketBoardId
  dealStageId
  dealPipelineId
  dealBoardId
  purchaseStageId
  purchasePipelineId
  purchaseBoardId
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
  googleClientId
  googleClientSecret
  googleRedirectUri
  facebookAppId
  erxesAppToken

  kbToggle
  publicTaskToggle
  ticketToggle
  taskToggle
  dealToggle
  purchaseToggle
  otpConfig {
    smsTransporterType
    content
    codeLength
    loginWithOTP
    expireAfter
  }

  mailConfig {
    subject
    invitationContent
    registrationContent
  }

  manualVerificationConfig {
    userIds
    verifyCustomer
    verifyCompany
  }

  passwordVerificationConfig {
    verifyByOTP
    emailSubject
    emailContent
    smsContent
  }

  tokenExpiration
  refreshTokenExpiration
  tokenPassMethod
  vendorParentProductCategoryId
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
  lastSeenAt
  sessionCount
  isOnline

  avatar
`;

export const clientPortalUserFields = `
  ${basicFields}
  createdAt

  verificationRequest {
    status
    attachments{
      name
      url
      size
      type
    }
    description
  }

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
  $dateFilters: String,
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
  dateFilters: $dateFilters,
  ${conformityQueryFieldDefs}
`;

const getTotalCount = `
  query clientPortalConfigsTotalCount {
    clientPortalConfigsTotalCount
  }
`;

const getConfigs = `
  query clientPortalGetConfigs($kind: BusinessPortalKind $page: Int, $perPage: Int) {
    clientPortalGetConfigs(kind: $kind, page: $page, perPage: $perPage) {
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
  query clientPortalGetLast($kind: BusinessPortalKind) {
    clientPortalGetLast(kind: $kind) {
      ${commonFields}
    }
  }
`;

const clientPortalUsers = `
  query clientPortalUsers(${listParamsDef}) {
    clientPortalUsers(${listParamsValue}) {
      ${clientPortalUserFields}
      isPhoneVerified
      isEmailVerified
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
      ${isEnabled('forum') ? 'forumSubscriptionEndsAfter' : ''}
      customer {
        firstName
        lastName
        primaryEmail
        primaryPhone
      }
      company {
        primaryName
        primaryEmail
        primaryPhone
      }
    }
  }
`;

const clientPortalComments = `
  query clientPortalComments($typeId: String!, $type: String!) {
    clientPortalComments(typeId: $typeId, type: $type) {
      _id
      content
      createdAt
      createdUser
    }
  }
`;

const fieldConfig = `
query ClientPortalFieldConfig($fieldId: String) {
  clientPortalFieldConfig(fieldId: $fieldId) {
    allowedClientPortalIds
    fieldId
    requiredOn
  }
}
`;

const usersOfCard = `
query ClientPortalCardUsers($contentType: String!, $contentTypeId: String!, $userKind: BusinessPortalKind) {
  clientPortalCardUsers(contentType: $contentType, contentTypeId: $contentTypeId, userKind: $userKind) {
    _id
    firstName
    lastName
    email
    phone
    username
    company {
      _id
      primaryName
      primaryEmail
      primaryPhone
    }
    clientPortal {
      _id
      name
      url
    }
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
  clientPortalUserCounts,
  clientPortalComments,
  fieldConfig,
  usersOfCard
};
