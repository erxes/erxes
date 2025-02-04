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
  isComplete
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
  query taskDetail($_id: String!, $clientPortalCard: Boolean) {
    taskDetail(_id: $_id, clientPortalCard: $clientPortalCard) {
     ${itemFields}
    }
  }
`;

const clientPortalGetDeal = `
  query dealDetail($_id: String!, $clientPortalCard: Boolean) {
    dealDetail(_id: $_id, clientPortalCard: $clientPortalCard) {
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
  query clientPortalTasks($priority: [String], $labelIds: [String], $stageId: String, $closeDateType: String, $userIds: [String], $date: TasksItemDate) {
    clientPortalTasks(priority: $priority, labelIds: $labelIds, stageId: $stageId, closeDateType: $closeDateType, userIds: $userIds, date: $date) {
      ${itemFields}
    }
  }
`;

const clientPortalTickets = `
  query clientPortalTickets ($priority: [String], $labelIds: [String], $stageId: String, $closeDateType: String, $userIds: [String], $date: TicketsItemDate){
    clientPortalTickets(priority: $priority, labelIds: $labelIds, stageId: $stageId, closeDateType: $closeDateType, userIds: $userIds, date: $date) {
      ${itemFields}
    }
  }
`;

const clientPortalDeals = `
  query clientPortalDeals($priority: [String], $labelIds: [String], $stageId: String, $closeDateType: String, $userIds: [String], $date: SalesItemDate) {
    clientPortalDeals(priority: $priority, labelIds: $labelIds, stageId: $stageId, closeDateType: $closeDateType, userIds: $userIds, date: $date) {
      ${itemFields}
      productsData  
    }
  }
`;

const clientPortalPurchases = `
  query clientPortalPurchases($priority: [String], $labelIds: [String], $stageId: String, $closeDateType: String, $userIds: [String], $date: PurhcasesItemDate) {
    clientPortalPurchases(priority: $priority, labelIds: $labelIds, stageId: $stageId, closeDateType: $closeDateType, userIds: $userIds, date: $date) {
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

const labelFields = `
  _id
  name
  colorCode
`;

const ticketPipelineLabels = `
query TicketPipelineLabels($pipelineId: String!) {
  ticketsPipelineLabels(pipelineId: $pipelineId) {
    ${labelFields}
  }
}
`;

const dealPipelineLabels = `
query DealPipelineLabels($pipelineId: String!) {
  salesPipelineLabels(pipelineId: $pipelineId) {
    ${labelFields}
  }
}
  `;

const taskPipelineLabels = `
query TaskPipelineLabels($pipelineId: String!) {
  tasksPipelineLabels(pipelineId: $pipelineId) {
    ${labelFields}
  }
}
  `;

const purchasePipelineLabels = `
query PurchasePipelineLabels($pipelineId: String!) {
  purchasePipelineLabels(pipelineId: $pipelineId) {
    ${labelFields}
  } 
}
  `;

const stagesQueryAttributes = `
  $isNotLost: Boolean,
  $pipelineId: String,
  $search: String,
  $customerIds: [String],
  $companyIds: [String],
  $assignedUserIds: [String],
  $labelIds: [String],
  $extraParams: JSON,
  $closeDateType: String,
  $assignedToMe: String,
  $branchIds: [String], 
  $departmentIds: [String],
  $segmentData: String
`;

const stagesQueryVariables = `
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
`;

const stagesQueryFields = `
      _id
    name
    order
    amount
    itemsTotalCount
    pipelineId
    code
    age
`;

const ticketStages = `
query TicketStages(${stagesQueryAttributes}) {
  ticketsStages(
    ${stagesQueryVariables}
  ) {
    ${stagesQueryFields}
  }
}
`;

const taskStages = `
query TaskStages(${stagesQueryAttributes}) {
  tasksStages(
    ${stagesQueryVariables}
  ) {
    ${stagesQueryFields}
  }
}
`;

const dealStages = `
query DealStages(${stagesQueryAttributes}) {
  salesStages(
    ${stagesQueryVariables}
  ) {
    ${stagesQueryFields}
  }
}
`;

const purchaseStages = `
query PurchaseStages(${stagesQueryAttributes}) {
  purchasesStages(
    ${stagesQueryVariables}
  ) {
    ${stagesQueryFields}
  }
}
`;

const userFields = `
     _id
    email
    details {
      avatar
      firstName
      lastName
      fullName
    }
`

const ticketPipelineAssignedUsers = `
query TicketsPipelineAssignedUsers($_id: String!) {
  ticketsPipelineAssignedUsers(_id: $_id) {
    ${userFields}
  }
}`;

const dealPipelineAssignedUsers = `
query SalesPipelineAssignedUsers($_id: String!) {
  salesPipelineAssignedUsers(_id: $_id) {
    ${userFields}
  }
}`;

const taskPipelineAssignedUsers = `
query TasksPipelineAssignedUsers($_id: String!) {
  tasksPipelineAssignedUsers(_id: $_id) {
    ${userFields}
  }
}

`;

const purchasePipelineAssignedUsers = `
query PurchasesPipelineAssignedUsers($_id: String!) {
  purchasePipelineAssignedUsers(_id: $_id) {
    ${userFields}
  }
}
`;


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

const taskChecklists = `
    query checklists($contentType: String, $contentTypeId: String) {
      tasksChecklists( contentType: $contentType, contentTypeId: $contentTypeId  ) {
        _id
      }
    }
`;

const ticketChecklists = `
    query checklists($contentType: String, $contentTypeId: String) {
      ticketsChecklists( contentType: $contentType, contentTypeId: $contentTypeId  ) {
        _id
      }
    }
`;

const dealChecklists = `
    query checklists($contentType: String, $contentTypeId: String) {
      salesChecklists( contentType: $contentType, contentTypeId: $contentTypeId  ) {
        _id
      }
    }
`;

const taskChecklistDetail = `
  query checklistDetail($_id: String!) {
    tasksChecklistDetail(_id: $_id) {
      _id
      contentType
      contentTypeId
      title
      createdUserId
      createdDate
      items {
        _id
        checklistId
        isChecked
        content
      }
      percent    
    }
  }
`;

const ticketChecklistDetail = `
  query checklistDetail($_id: String!) {
    ticketsChecklistDetail(_id: $_id) {
      _id
      contentType
      contentTypeId
      title
      createdUserId
      createdDate
      items {
        _id
        checklistId
        isChecked
        content
      }
      percent    
    }
  }
`;

const dealChecklistDetail = `
  query checklistDetail($_id: String!) {
    salesChecklistDetail(_id: $_id) {
      _id
      contentType
      contentTypeId
      title
      createdUserId
      createdDate
      items {
        _id
        checklistId
        isChecked
        content
      }
      percent    
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
  taskPipelineLabels,
  dealPipelineLabels,
  ticketPipelineLabels,
  purchasePipelineLabels,
  ticketPipelineAssignedUsers,
  dealPipelineAssignedUsers,
  taskPipelineAssignedUsers,
  purchasePipelineAssignedUsers,
  ticketStages,
  taskStages,
  dealStages,
  purchaseStages,
  productCategories,
  taskChecklists,
  ticketChecklists,
  dealChecklists,
  taskChecklistDetail,
  ticketChecklistDetail,
  dealChecklistDetail
};
