import {
  attachmentType,
  attachmentInput
} from '@erxes/api-utils/src/commonTypeDefs';

export const types = () => `
  ${attachmentType}
  ${attachmentInput}

  extend type User @key(fields: "_id"){
    _id: String @external
  }

  type SalesLog  @key(fields: "_id"){
    _id: String,
    branchDetail: Branch,
    branchId: String,
    description String,
    name: String,
    type: String,
    unitId:String,
    unitDetail: Unit,
    createdBy:String,
    createdAt: Date,
    createdUser: User,
    status: String
  },

  type Label {
    _id: String,
    title: String,
    color: String,
    type: String,
    status: String
  },

  type Timeframe {
    _id: String,
    name: String,
    description: String,
    startTime: Int,
    endTime: Int
  },

  type DayPlanConfig {
    _id: String,
    salesLogId: String,
    labelIds: [String],
    timeframeId: String
  },

  type MonthPlanConfig {
    _id: String,
    salesLogId: String,
    labelIds: [String],
    day: Date
  },

  type YearPlanConfig {
    _id: String,
    salesLogId: String,
    labelIds: [String],
    month: Int
  },

  input TimeframeInput {
    _id: String,
    name: String,
    description: String,
    startTime: Int,
    endTime: Int
  },

  input AddTimeframeInput {
    name: String,
    description: String,
    startTime: Int,
    endTime: Int
  },

  input LabelInput {
    _id: String,
    title: String,
    color: String,
    type: String,
    status:String
  },

  input AddLabelInput {
    title: String,
    color: String,
    type: String,
    status:String 
  },
`;

const salesLogPrams = `
  branchId: String,
  date: Date,
  description:String,
  name:String,
  type:String,
  unitId:String
`;
export const queries = `
  getDayPlanConfig(salesLogId: String): [DayPlanConfig]
  getMonthPlanConfig(salesLogId: String): [MonthPlanConfig]
  getBranches: [Branch]
  getProducts: [Products]
  getUnits: [Unit]
  getLabels(type: String): [Label]
  getSalesLogs:[SalesLog]
  getTimeframes:[Timeframe]
`;

export const mutations = `
  saveSalesLog(${salesLogPrams}): JSON
  saveLabels(update: [LabelInput], add: [AddLabelInput]): JSON
  saveTimeframe(update:[TimeframeInput], add :[AddTimeframeInput]):JSON
  saveDayPlanConfig(salesLogId: String, data:JSON):JSON
  saveMonthPlanConfig(salesLogId: String, date: Date, data:JSON):JSON
  removeLabel(_id:String):JSON
  removeDayTimeframe(_id: String): JSON
  removeSalesLog(_id: String):JSON

`;
