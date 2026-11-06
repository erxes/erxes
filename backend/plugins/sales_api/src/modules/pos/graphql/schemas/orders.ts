import { GQL_CURSOR_PARAM_DEFS } from 'erxes-api-shared/utils';

const posOrderFields = () => `
  _id: String,
  createdAt: Date,
  status: String,
  paidDate: Date,
  dueDate: Date,
  number: String,
  customerId: String,
  customerType: String,
  brokerId: String,
  brokerType: String,
  brokerName: String,
  cashAmount: Float,
  mobileAmount: Float,
  paidAmounts: JSON,
  totalAmount: Float,
  finalAmount: Float,
  shouldPrintEbarimt: Boolean,
  printedEbarimt: Boolean,
  billType: String,
  billId: String,
  registerNumber: String,
  oldBillId: String,
  type: String,
  userId: String,
  items: JSON,
  posToken: String,
  posName: String,
  branchId: String,
  departmentId: String,
  subBranchId: String,
  branch: JSON,
  department: JSON,
  subBranch: JSON,
  user: User,
  customer: CustomerPos
  syncedErkhet: Boolean,
  accountingResponse: String,
  description: String,
  isPre: Boolean,
  origin: String,
  convertDealId: String,
  returnInfo: JSON
`;

export const types = () => `
  type CustomerPos {
    _id: String!
    code: String
    primaryPhone: String
    firstName: String
    primaryEmail: String
    lastName: String
  }

  type PosOrder {
    ${posOrderFields()}
    returnDescription: String
  }

  type PosOrderDetail {
    ${posOrderFields()}
    syncErkhetInfo: String
    putResponses: JSON
    deliveryInfo: JSON
    deal: JSON
    dealLink: String
  }

  type PosOrderRecord {
    ${posOrderFields()}
  }

  type PosOrdersByCustomer {
    _id: String,
    customerType: String,
    customerDetail:JSON,
    orders:[PosOrder]
    totalOrders:Int,
    totalAmount:Int
  }

  type PosOrdersBySubs {
    _id: String,
    customerType: String,
    customerId:String,
    customer:JSON,
    status:String
    closeDate:Date
  }

  type PosProduct {
    _id: String!
    name: String
    code: String
    type: String
    uom: String
    unitPrice: Float
    categoryId: String
    createdAt: Date,
    counts: JSON,
    count: Float,
    amount: Float,
    category: ProductCategory
  }
  type PosProducts {
    products: [PosProduct],
    totalCount: Float,
  }

  type PosOrderListResponse {
    list: [PosOrder]
    totalCount: Int
    pageInfo: PageInfo
  }

  type SalesPosScoreLog {
    orderId: String!
    orderNumber: String
    posId: String
    posName: String
    branchId: String
    scoreLogId: String!
  }

  type SalesPosScoreLogList {
    list: [SalesPosScoreLog!]!
    totalCount: Int!
  }

  type SalesPosScoreLogPosTotal {
    posId: String
    posName: String
    earned: Float!
    spent: Float!
    refunded: Float!
    other: Float!
    recalculated: Float!
    net: Float!
  }

  type SalesPosScoreLogOrderTotal {
    orderId: String!
    orderNumber: String
    posName: String
    earned: Float!
    net: Float!
  }

  type SalesPosScoreLogInsights {
    # Per action, without recalculations.
    totals: [SalesDealScoreLogActionTotal!]!
    # Every entry counted, recalculations included.
    entryCount: Int!
    recalculatedEarned: Float!
    recalculatedSpent: Float!
    net: Float!
    orderCount: Int!
    customerCount: Int!
    byPos: [SalesPosScoreLogPosTotal!]!
    topOrders: [SalesPosScoreLogOrderTotal!]!
    byCashier: [SalesDealScoreLogGroupTotal!]!
    byBranch: [SalesDealScoreLogGroupTotal!]!
    topEarners: [SalesDealScoreLogGroupTotal!]!
    topSpenders: [SalesDealScoreLogGroupTotal!]!
  }
`;

const commonQueryParams = `
  page: Int
  perPage: Int
  sortField: String
  sortDirection: Int

`;

const queryParams = `
  ${commonQueryParams}
  search: String
  paidStartDate: Date
  paidEndDate: Date
  createdStartDate: Date
  createdEndDate: Date
  paidDate: String
  userId: String
  customerId: String
  customerType: String
  posId: String
  posToken: String
  types: [String]
  statuses: [String]
  excludeStatuses: [String]
  hasPaidDate: Boolean
  brandId: String
  dealId: String
`;

const groupParams = `
  groupField: String
`;

const commonSubsQueryParams = `
  ${commonQueryParams}
  customerId:String,
  userId:String,
  companyId:String,
  status:String,
  closeFrom:String,
  closeTo:String,
`;

export const queries = `
  posOrders(${queryParams}): [PosOrder]
  posOrdersList(${GQL_CURSOR_PARAM_DEFS} ${queryParams}): PosOrderListResponse
  posOrderDetail(_id: String): PosOrderDetail
  posOrderLink(_id: String): JSON
  posProducts(${queryParams} categoryId: String, searchValue: String): PosProducts
  posOrdersSummary(${queryParams}): JSON
  posOrdersGroupSummary(${queryParams}, ${groupParams}): JSON
  posOrdersTotalCount(${queryParams}): JSON
  posOrderRecords(${queryParams}): [PosOrderRecord]
  posOrderRecordsCount(${queryParams}): Int
  posOrderCustomers(${commonQueryParams}):[PosOrdersByCustomer]
  posOrderCustomersTotalCount(${commonQueryParams}):Int
  salesPosScoreLogs(posIds: [String], orderIds: [String], branchIds: [String], kind: SalesScoreLogKind, period: SalesScoreLogPeriod, ${queryParams}): SalesPosScoreLogList
  salesPosScoreLogInsights(posIds: [String], orderIds: [String], branchIds: [String], ${queryParams}): SalesPosScoreLogInsights
  salesPosScoreLogTimeline(interval: SalesDealScoreLogInterval!, timezone: String, posIds: [String], orderIds: [String], branchIds: [String], ${queryParams}): SalesDealScoreLogTimeline
  checkSubscription(customerId:String, productId:String,productIds:[String]): PosOrder
  posOrderBySubscriptions(${commonSubsQueryParams}):[PosOrdersBySubs]
  posOrderBySubscriptionsTotalCount(${commonSubsQueryParams}):Int
`;

export const mutations = `
  posOrderChangePayments(_id: String!, cashAmount: Float, mobileAmount: Float, paidAmounts: JSON, description: String): PosOrder
`;
