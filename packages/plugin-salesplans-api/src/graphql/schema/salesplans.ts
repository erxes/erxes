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

  extend type User @key(fields: "_id") {
    _id: String! @external
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

  type Label {
    _id: String
    title: String
    color: String
    type: String
    status: String
  },

  type Timeframe {
    _id: String
    name: String
    description: String
    startTime: Int
    endTime: Int
  },

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

  input TimeframeInput {
    _id: String
    name: String
    description: String
    startTime: Int
    endTime: Int
  },

  input AddTimeframeInput {
    name: String
    description: String
    startTime: Int
    endTime: Int
  },

  input LabelInput {
    _id: String
    title: String
    color: String
    type: String
    status:String
  },

  input AddLabelInput {
    title: String
    color: String
    type: String
    status:String
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

export const queries = `
  dayPlanConfig(salesLogId: String): [DayPlanConfig]
  monthPlanConfig(salesLogId: String): [MonthPlanConfig]
  yearPlanConfig(salesLogId: String): [YearPlanConfig]
  labels(type: String): [Label]
  salesLogs(
    type: String,
    status: String
  ): [SalesLog]
  salesLogDetail(salesLogId: String): SalesLog
  timeframes: [Timeframe]
`;

export const mutations = `
  salesLogAdd(${salesLogParams}): SalesLog
  salesLogEdit(${salesLogDocumentParams}): SalesLog
  salesLogRemove(_id: String): JSON
  salesLogProductUpdate(_id: String, data: ProductInput): JSON
  salesLogProductRemove(_id: String, productId: String): JSON
  salesLogStatusUpdate(_id: String, status: String): JSON
  labelsEdit(update: [LabelInput], add: [AddLabelInput]): [Label]
  labelsRemove(_id:String): JSON
  timeframesEdit(update:[TimeframeInput], add:[AddTimeframeInput]): [Timeframe]
  timeframesRemove(_id: String): JSON
  saveDayPlanConfig(salesLogId: String, data:JSON):[DayPlanConfig]
  saveMonthPlanConfig(salesLogId: String, day: Date, data:JSON):[MonthPlanConfig]
  saveYearPlanConfig(salesLogId: String, data:JSON):[YearPlanConfig]
`;
