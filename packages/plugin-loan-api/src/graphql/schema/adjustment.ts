import {
  attachmentType,
  attachmentInput
} from '@erxes/api-utils/src/commonTypeDefs';

export const types = () => `

  ${attachmentType}
  ${attachmentInput}

  extend type User @key(fields: "_id") {
    _id: String! @external
  }

  type Adjustment {
    _id: String!
    createdAt: Date
    createdBy: String 
    date: Date

    user: User
  }

  type AdjustmentsListResponse {
    list: [Adjustment],
    totalCount: Float,
  }
`;

const queryParams = `
  page: Int
  perPage: Int
  searchValue: String
  startDate: Date
  endDate: Date
  sortField: String
  sortDirection: Int
`;

export const queries = `
  adjustmentsMain(${queryParams}): AdjustmentsListResponse
  adjustments(${queryParams}): [Adjustment]
  adjustmentDetail(_id: String!): Adjustment
`;

const commonFields = `
  date: Date
`;

export const mutations = `
  adjustmentsAdd(${commonFields}): Adjustment
  adjustmentsEdit(_id: String!, ${commonFields}): Adjustment
  adjustmentsRemove(adjustmentIds: [String]): [String]
`;
