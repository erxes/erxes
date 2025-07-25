import {
  conformityQueryFieldDefs,
  conformityQueryFields,
} from '@erxes/ui-sales/src/conformity/graphql/queries';

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
    emailSubject
  }
  twoFactorConfig {
    smsTransporterType
    content
    codeLength
    enableTwoFactor
    expireAfter
    emailSubject
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

  socialpayConfig {
    certId
    publicKey
  }

  tokiConfig {
    merchantId
    apiKey
    username
    password
    production
  }

  testUserEmail
  testUserPhone
  testUserPassword
  testUserOTP

  tokenExpiration
  refreshTokenExpiration
  tokenPassMethod
  vendorParentProductCategoryId
  language
  languages

  environmentVariables {
    key
    value
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
    _id
    name
    kind
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
      createdUser {
        _id
        email
        lastName
        firstName
        avatar
      }
    }
  }
`;

const widgetComments = `
  query widgetsTicketComments($typeId: String!, $type: String!) {
    widgetsTicketComments(typeId: $typeId, type: $type) {
      _id
      content
      createdUser {
        _id
        email
        lastName
        firstName
        avatar
      }
      type
      userType
      createdAt
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

const cardFields = `
_id
companies {
  _id
  primaryName
  primaryEmail
  primaryPhone
}
assignedUsers {
  _id
  details {
    avatar
    firstName
    fullName
    lastName
    shortName
  }
  email
  username
}
customers {
  _id
  firstName
  lastName
  middleName
  primaryEmail
  primaryPhone
}
name
boardId
stageId
status
pipeline {
  _id
}
createdAt
`;

const tasksOfUser = `
query ClientPortalUserTasks($userId: String) {
  clientPortalUserTasks(userId: $userId) {
    ${cardFields}
  }
}
`;

const dealsOfUser = `
query ClientPortalUserDeals($userId: String) {
  clientPortalUserDeals(userId: $userId) {
    ${cardFields}
  }
}
`;

const ticketsOfUser = `
query ClientPortalUserTickets($userId: String) {
  clientPortalUserTickets(userId: $userId) {
    ${cardFields}
  }
}
`;

const purchasesOfUser = `
query ClientPortalUserPurchases($userId: String) {
  clientPortalUserPurchases(userId: $userId) {
    ${cardFields}
  }
}
`;

const clientPortalParticipantDetail = `
query clientPortalParticipantDetail($contentType: String!, $cpUserId: String!, $contentTypeId: String!) {
  clientPortalParticipantDetail(contentType: $contentType, cpUserId: $cpUserId, contentTypeId: $contentTypeId) {
    _id
    contentType
    contentTypeId
    cpUserId
    createdAt
    hasVat
    modifiedAt
    offeredAmount
    paymentAmount
    paymentStatus
    status
  }
}`;

const clientPortalParticipants = `
query clientPortalParticipants($contentType: String!, $userKind: BusinessPortalKind!, $contentTypeId: String!) {
  clientPortalParticipants(contentType: $contentType, userKind: $userKind, contentTypeId: $contentTypeId) {
    _id
    contentType
    contentTypeId
    cpUserId
    cpUser {
      _id
      phone
      email
      firstName
      lastName
    }
    createdAt
    hasVat
    modifiedAt
    offeredAmount
    paymentAmount
    paymentStatus
    status
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
  usersOfCard,
  tasksOfUser,
  dealsOfUser,
  ticketsOfUser,
  purchasesOfUser,
  clientPortalParticipantDetail,
  clientPortalParticipants,
  widgetComments,
};
