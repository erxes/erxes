const itemFields = `
  _id
  name
  number
  pipeline {
    _id
    name
  }
  description
  modifiedAt
  modifiedBy
  status
  priority
  createdAt
  closeDate
  startDate
  assignedUsers {
    _id
    email
    username
    details {
      avatar
      firstName
      lastName
      fullName
    }
  }
  attachments {
    name
    url
    type
    size
  }
  createdUser {
    _id
    email
    username
    details {
      firstName
      lastName
      fullName
    }
  }
  customFieldsData
  customProperties
  stageChangedDate
  stage {
    name
    itemsTotalCount
  }
  labels {
    name
    colorCode
  }
`;

const clientPortalGetTicket = `
  query clientPortalTicket($_id: String!) {
    clientPortalTicket(_id: $_id) {
      ${itemFields}
    }
  }
`;

const clientPortalGetTask = `
  query taskDetail($_id: String!) {
    taskDetail(_id: $_id) {
     ${itemFields}
    }
  }
`;

const clientPortalGetDeal = `
  query dealDetail($_id: String!) {
    dealDetail(_id: $_id) {
      ${itemFields}
      productsData
    }
  }
`;

const clientPortalGetPurchase = `
  query purchaseDetail($_id: String!) {
    purchaseDetail(_id: $_id) {
      ${itemFields}
    }
  }
`;

const clientPortalTasks = `
  query clientPortalTasks($priority: [String], $labelIds: [String], $stageId: String, $closeDateType: String, $userIds: [String]) {
    clientPortalTasks(priority: $priority, labelIds: $labelIds, stageId: $stageId, closeDateType: $closeDateType, userIds: $userIds) {
      ${itemFields}
    }
  }
`;

const clientPortalTickets = `
  query clientPortalTickets ($priority: [String], $labelIds: [String], $stageId: String, $closeDateType: String, $userIds: [String]){
    clientPortalTickets(priority: $priority, labelIds: $labelIds, stageId: $stageId, closeDateType: $closeDateType, userIds: $userIds) {
      ${itemFields}
    }
  }
`;

const clientPortalDeals = `
  query clientPortalDeals($priority: [String], $labelIds: [String], $stageId: String, $closeDateType: String, $userIds: [String]) {
    clientPortalDeals(priority: $priority, labelIds: $labelIds, stageId: $stageId, closeDateType: $closeDateType, userIds: $userIds) {
      ${itemFields}
      productsData  
    }
  }
`;

const clientPortalPurchases = `
  query clientPortalPurchases($priority: [String], $labelIds: [String], $stageId: String, $closeDateType: String, $userIds: [String]) {
    clientPortalPurchases(priority: $priority, labelIds: $labelIds, stageId: $stageId, closeDateType: $closeDateType, userIds: $userIds) {
      ${itemFields}
    }
  }
`;

const clientPortalComments = `
  query clientPortalComments($typeId: String!, $type: String!) {
    clientPortalComments(typeId: $typeId, type: $type) {
      _id
      content
      createdUser {
        _id
        avatar
        firstName
        fullName
        lastName
        email
        username
      }
      createdAt
      userType
      type
    }
  }
`;

const fields = `
  query fields($contentType: String!, $contentTypeId: String, $isVisibleToCreate: Boolean, $pipelineId: String) {
    fields(contentType: $contentType, contentTypeId: $contentTypeId, isVisibleToCreate: $isVisibleToCreate, pipelineId: $pipelineId) {
      _id
      type
      validation
      text
      field
      content
      description
      options
      objectListConfigs {
        key
        label
        type
      }
      isRequired
      order
      column
      logicAction
      logics {
        fieldId
        logicOperator
        logicValue
      }
      groupName
      associatedFieldId
      associatedField {
        _id
        text
        contentType
      }
      pageNumber
      productCategoryId
      isDefinedByErxes
      optionsValues,
    }
  }
`;

export const commonStructureParamsDef = `
    $ids: [String]
    $excludeIds: Boolean,
    $perPage: Int,
    $page: Int
    $searchValue: String,
    $status:String,
`;

export const commonStructureParamsValue = `
    ids: $ids
    excludeIds: $excludeIds,
    perPage: $perPage,
    page: $page
    searchValue: $searchValue
    status: $status
`;

export const branchField = `
  _id
  title
  address
  parentId
  supervisorId
  code
  order
  userIds
  userCount
  users {
    _id
    details {
      avatar
      fullName
    }
  }
  radius
`;

const branches = `
  query branches(${commonStructureParamsDef}, $withoutUserFilter: Boolean) {
    branches (${commonStructureParamsValue}, withoutUserFilter: $withoutUserFilter){
      ${branchField}
      parent {${branchField}}
    }
  }
`;

const departments = `
query departments($withoutUserFilter: Boolean) {
  departments(withoutUserFilter: $withoutUserFilter) {
    _id
    title
    description
    parentId
    code
    supervisorId
    userIds
  }
}
`;

const productFields = `
  _id
  name
  type
  code
  categoryId
  vendorId
  description
  unitPrice
  createdAt
  category {
    _id
    code
    name
  }
`;

const products = `
  query products(
    $type: String,
    $categoryId: String,
    $tag: String,
    $searchValue: String,
    $perPage: Int,
    $page: Int $ids: [String],
    $excludeIds: Boolean,
    $pipelineId: String,
    $boardId: String,
    $segment: String,
    $segmentData: String
  ) {
    products(
      type: $type,
      categoryId: $categoryId,
      tag: $tag,
      searchValue: $searchValue,
      perPage: $perPage,
      page: $page ids: $ids,
      excludeIds: $excludeIds,
      pipelineId: $pipelineId,
      boardId: $boardId,
      segment: $segment,
      segmentData: $segmentData
    ) {
      ${productFields}
    }
  }
`;

const pipelineLabels = `
query pipelineLabels($pipelineId: String!) {
  pipelineLabels(pipelineId: $pipelineId) {
    _id
    name
    colorCode
  }
}
`;
const stages = `
query stages($isNotLost: Boolean, $pipelineId: String!, $search: String, $customerIds: [String], $companyIds: [String], $assignedUserIds: [String], $labelIds: [String], $extraParams: JSON, $closeDateType: String, $assignedToMe: String, $branchIds: [String], $departmentIds: [String], $segmentData: String) {
  stages(
    isNotLost: $isNotLost
    pipelineId: $pipelineId
    search: $search
    customerIds: $customerIds
    companyIds: $companyIds
    assignedUserIds: $assignedUserIds
    labelIds: $labelIds
    extraParams: $extraParams
    closeDateType: $closeDateType
    assignedToMe: $assignedToMe
    branchIds: $branchIds
    departmentIds: $departmentIds
    segmentData: $segmentData
  ) {
    _id
    name
    order
    amount
    itemsTotalCount
    pipelineId
    code
    age
    __typename
  }
}
`;

const pipelineAssignedUsers = `
query pipelineAssignedUsers($_id: String!) {
  pipelineAssignedUsers(_id: $_id) {
    _id
    email
    details {
      avatar
      firstName
      lastName
      fullName
      __typename
    }
    __typename
  }
}`;

const productCategories = `
  query productCategories($status: String) {
    productCategories(status: $status) {
      _id
      name
      order
      code
      parentId
      description
      status
      meta
      attachment {
        name
        url
        type
        size
      }

      isRoot
      productCount
    }
  }
`;

export default {
  clientPortalGetTicket,
  clientPortalGetDeal,
  clientPortalGetPurchase,
  clientPortalGetTask,
  clientPortalTickets,
  clientPortalDeals,
  clientPortalPurchases,
  clientPortalTasks,
  clientPortalComments,
  fields,
  departments,
  branches,
  products,
  pipelineLabels,
  pipelineAssignedUsers,
  stages,
  productCategories
};
