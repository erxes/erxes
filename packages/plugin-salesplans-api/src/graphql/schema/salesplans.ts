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

  extend type User @key(fields: "_id") {
    _id: String! @external
  }

  type SalesLog @key(fields: "_id"){
    _id: String!
    branchId: String
    date: Date
    branchDetail: Branch
    description: String
    name: String
    type: String
    departmentId:String
    departmentDetail: Department
    createdBy:String
    createdUser: User
    createdAt: Date
    status: String
    products: [Product]
  },


  type Quantity {
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
    _id: String
    quantities: [QuantityInput]
  }

  input QuantityInput {
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
  },
`;

const salesLogParams = `
  name: String,
  description: String,
  date: Date,
  type:String,
  branchId: String,
  departmentId:String,
`;

const salesLogDocumentParams = `
  _id: String,
  description: String,
  name: String,
  type: String,
  date: Date,
  branchId: String,
  departmentId: String,
  products: [ProductInput]
`;

export const queries = `
  getDayPlanConfig(salesLogId: String): [DayPlanConfig]
  getMonthPlanConfig(salesLogId: String): [MonthPlanConfig]
  getYearPlanConfig(salesLogId: String): [YearPlanConfig]
  getLabels(type: String): [Label]
  getSalesLogs: [SalesLog]
  getSalesLogDetail(salesLogId: String): SalesLog
  getTimeframes:[Timeframe]
`;

export const mutations = `
  createSalesLog(${salesLogParams}): SalesLog
  updateSalesLog(${salesLogDocumentParams}): SalesLog
  removeSalesLog(_id: String): JSON
  saveLabels(update: [LabelInput], add: [AddLabelInput]): [Label]
  removeLabel(_id:String): JSON
  saveTimeframes(update:[TimeframeInput], add:[AddTimeframeInput]):[Timeframe]
  removeTimeframe(_id: String): JSON
  saveDayPlanConfig(salesLogId: String, data:JSON):[DayPlanConfig]
  saveMonthPlanConfig(salesLogId: String, day: Date, data:JSON):[MonthPlanConfig]
  saveYearPlanConfig(salesLogId: String, data:JSON):[YearPlanConfig]
`;
