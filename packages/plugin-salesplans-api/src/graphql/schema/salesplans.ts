import {
  attachmentType,
  attachmentInput
} from '@erxes/api-utils/src/commonTypeDefs';

export const types = () => `
  ${attachmentType}
  ${attachmentInput}

  extend type Branch @key(fields: "_id") {
    _id: String! @external
  }

  extend type Department @key(fields: "_id") {
    _id: String! @external
  }

  extend type Product @key(fields: "_id") {
    _id: String! @external
  }

  extend type Uom @key(fields: "_id") {
    _id: String! @external
  }

  extend type User @key(fields: "_id") {
    _id: String! @external
  }

  type YearPlan @key(fields: "_id") @cacheControl(maxAge: 3) {
    _id: String,
    year: Int,
    confirmedData: JSON,
    departmentId: String,
    branchId: String,
    productId: String,
    uomId: String,
    values: JSON
    createdAt: Date,
    createdBy: String,
    modifiedAt: Date,
    modifiedBy: String,

    department: Department,
    branch: Branch,
    product: Product,
    uom: Uom,
    createdUser: User,
    modifiedUser: User
  }

  type SalesLog @key(fields: "_id") @cacheControl(maxAge: 3){
    _id: String!
    name: String
    description: String
    type: String
    date: Date
    status: String
    branchId: String
    branchDetail: Branch
    departmentId: String
    departmentDetail: Department
    createdBy:String
    createdUser: User
    createdAt: Date
    products: [SalesLogProduct]
    labels: [String]
  },

  type SalesLogProduct {
    productId: String
    intervals: [Interval]
  }

  type Interval {
    label: String
    value: String
  }

  type DayPlanConfig {
    _id: String
    salesLogId: String
    labelIds: [String]
    timeframeId: String
  },

  type MonthPlanConfig {
    _id: String
    salesLogId: String
    labelIds: [String]
    day: Int
  },

  type YearPlanConfig {
    _id: String
    salesLogId: String
    labelIds: [String]
    month: Int
  },

  input ProductInput {
    productId: String
    intervals: [IntervalInput]
  }

  input IntervalInput {
    label: String
    value: String
  }
`;

const salesLogParams = `
  name: String,
  description: String,
  date: Date,
  type: String,
  branchId: String,
  departmentId: String,
  labels: [String],
`;

const salesLogDocumentParams = `
  _id: String,
  description: String,
  name: String,
  type: String,
  date: Date,
  branchId: String,
  departmentId: String,
  labels: [String],
`;

export const paginateParams = `
  page: Int,
  perPage: Int,
  sortField: String,
  sortDirection: Int,
`;

export const planFilterParams = `
  _ids:[String],
  searchValue: String,
  filterStatus: String,
  departmentId: String,
  branchId: String,
  productId: String,
  productCategoryId: String,
  minValue: Float,
  maxValue: Float,
  dateType: String,
  startDate: Date,
  endDate: Date,
`;

export const queries = `
  dayPlanConfig(salesLogId: String): [DayPlanConfig]
  monthPlanConfig(salesLogId: String): [MonthPlanConfig]
  yearPlanConfig(salesLogId: String): [YearPlanConfig]
  salesLogs(
    type: String,
    status: String
  ): [SalesLog]
  salesLogDetail(salesLogId: String): SalesLog

  yearPlans(year: Int, ${planFilterParams}, ${paginateParams}): [YearPlan],
  yearPlansCount(year: Int, ${planFilterParams}, ${paginateParams}): Int,
`;

export const planCreateParams = `
  year: Int,
  departmentId: String,
  branchId: String,
  productCategoryId: String,
  productId: String,
`;

export const mutations = `
  salesLogAdd(${salesLogParams}): SalesLog
  salesLogEdit(${salesLogDocumentParams}): SalesLog
  salesLogRemove(_id: String): JSON
  salesLogProductUpdate(_id: String, data: ProductInput): JSON
  salesLogProductRemove(_id: String, productId: String): JSON
  salesLogStatusUpdate(_id: String, status: String): JSON
  saveDayPlanConfig(salesLogId: String, data:JSON):[DayPlanConfig]
  saveMonthPlanConfig(salesLogId: String, day: Date, data:JSON):[MonthPlanConfig]
  saveYearPlanConfig(salesLogId: String, data:JSON):[YearPlanConfig]

  yearPlansAdd(${planCreateParams}): [YearPlan]
  yearPlansRemove(_ids: [String]): JSON
`;
