import { GQL_CURSOR_PARAM_DEFS } from 'erxes-api-shared/utils';

const typeDeps = `
  type SalesTimeTrack {
    status: String,
    timeSpent: Int,
    startDate: String
  }

  type DealTotalCurrency {
    amount: Float
    name: String
  }
`;

const inputDeps = `
  input SalesItemDate {
    month: Int
    year: Int
  }

  input SalesProductField {
    productId : String
    quantity: Int
    unitPrice: Float
  }
`;

const queryParams = `
  _ids: [String]
  date: SalesItemDate
  parentId:String
  pipelineId: String
  pipelineIds: [String]
  customerIds: [String]
  vendorCustomerIds: [String]
  companyIds: [String]
  assignedUserIds: [String]
  productIds: [String]
  closeDateType: String
  labelIds: [String]
  search: String
  priority: [String]
  userIds: [String]
  segment: String
  segmentData: String
  assignedToMe: String
  startDate: String
  endDate: String
  hasStartAndCloseDate: Boolean
  stageChangedStartDate: Date
  stageChangedEndDate: Date
  noSkipArchive: Boolean
  tagIds: [String]
  number: String
  branchIds: [String]
  departmentIds: [String]
  boardIds: [String]
  stageCodes: [String]
  dateRangeFilters:JSON,
  createdStartDate: Date,
  createdEndDate: Date
  stateChangedStartDate: Date
  stateChangedEndDate: Date
  startDateStartDate: Date
  startDateEndDate: Date
  closeDateStartDate: Date
  closeDateEndDate: Date
  resolvedDayBetween:[Int]
  relationType: String
  relationId: String

  ${GQL_CURSOR_PARAM_DEFS}
`;

export const types = `
  ${typeDeps}
  ${inputDeps}

  type Deal @key(fields: "_id") {
    _id: String!

    name: String!
    order: Float
    createdAt: Date
    hasNotified: Boolean
    assignedUserIds: [String]
    branchIds: [String]
    departmentIds:[String]
    branches: [Branch]
    departments: [Department]
    labelIds: [String]
    startDate: Date
    closeDate: Date
    description: String
    modifiedAt: Date
    modifiedBy: String
    reminderMinute: Int,
    isComplete: Boolean,
    isWatched: Boolean,
    stageId: String
    boardId: String
    priority: String
    status: String
    attachments: [Attachment]
    userId: String
    tagIds: [String]
    relations: [String]

    assignedUsers: [User]
    stage: SalesStage
    labels: [SalesPipelineLabel]
    pipeline: SalesPipeline
    createdUser: User
    customFieldsData: JSON
    score: Float
    timeTrack: SalesTimeTrack
    number: String
    stageChangedDate: Date

    customProperties: JSON

    unUsedAmount: JSON
    amount: JSON

    companies: [Company]
    customers: [Customer]

    tags: [Tag]

    products: [Product]
    productsData: JSON
    paymentsData: JSON

    cursor: String
  }

  type SalesTotalForType {
    _id: String
    name: String
    currencies: [DealTotalCurrency]
  }

  type DealsListResponse {
    list: [Deal],
    pageInfo: PageInfo
    totalCount: Int,
  }

  input IDealFilter {
    stageId: String,
    initialStageId: String,
    ${queryParams}
  }

  type DealSubscription {
    action: String
    deal: Deal
  }
  type DealProductsDataChangeResponse {
    _id: String
    processId: String
    action: String
    data: JSON
  }
`;

const archivedDealsParams = `
  pipelineId: String!
  search: String
  userIds: [String]
  priorities: [String]
  assignedUserIds: [String]
  labelIds: [String]
  productIds: [String]
  companyIds: [String]
  customerIds: [String]
  startDate: String
  endDate: String

  ${GQL_CURSOR_PARAM_DEFS}
 `;

export const queries = `
  checkDiscount(_id: String!,products:[SalesProductField], couponCode: String, voucherId: String):JSON
  
  deals(stageId: String, initialStageId: String, ${queryParams}): DealsListResponse
  dealDetail(_id: String!, clientPortalCard: Boolean): Deal
  dealsTotalCount(stageId: String, initialStageId: String, ${queryParams}): Int
  dealsTotalAmounts(${queryParams}): [SalesTotalForType]
  
  archivedDeals(${archivedDealsParams}): DealsListResponse
  archivedDealsCount(${archivedDealsParams}): Int
`;

const mutationParams = `
  parentId:String,
  processId: String,
  aboveItemId: String,
  stageId: String,
  assignedUserIds: [String],
  attachments: [AttachmentInput],
  startDate: Date,
  closeDate: Date,
  description: String,
  order: Int,
  reminderMinute: Int,
  isComplete: Boolean,
  priority: String,
  status: String,
  sourceConversationIds: [String],
  customFieldsData: JSON,
  tagIds: [String],
  branchIds: [String],
  departmentIds: [String],

  paymentsData: JSON,
  productsData: JSON,
  extraData: JSON,
`;

export const mutations = `
  dealsAdd(name: String, companyIds: [String], customerIds: [String], labelIds: [String], ${mutationParams}): Deal
  dealsEdit(_id: String!, name: String, ${mutationParams}): Deal
  dealsChange(itemId: String!, aboveItemId: String, destinationStageId: String!, sourceStageId: String, processId: String): Deal
  dealsRemove(_id: String!): Deal
  dealsWatch(_id: String, isAdd: Boolean): Deal
  dealsCopy(_id: String!, processId: String): Deal
  dealsArchive(stageId: String!, processId: String): String
  dealsCreateProductsData(processId: String, dealId: String, docs: JSON): JSON
  dealsEditProductData(processId: String, dealId: String, dataId: String, doc: JSON): JSON
  dealsDeleteProductData(processId: String, dealId: String, dataIds: [String]): JSON
`;
