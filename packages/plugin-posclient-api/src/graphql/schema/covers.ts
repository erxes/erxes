export const types = `
  type CoverSummary {
    _id: String
    kind: String
    kindOfVal: Float
    value: Float
    amount: Float
  }

  type CoverDetail {
    _id: String
    paidType: String
    
    paidSummary: [CoverSummary]
    paidDetail: JSON
  }

  type Cover {
    _id: String
    posToken: String
    status: String
    beginDate: Date
    endDate: Date
    description: String
    userId: String
    details: [CoverDetail]
    createdAt: Date
    createdBy: String
    modifiedAt: Date
    modifiedBy: String

    user: User
    createdUser:  User
    modifiedUser:  User
  }
`;

const coverParams = `
  status: String
  beginDate: Date
  endDate: Date
  description: Date
  userId: String
  details: JSON
`;

export const mutations = `
  coversAdd(${coverParams}): Cover
  coversEdit(_id: String!, ${coverParams}): Cover
  coversRemove(_id: String!): String
  coversConfirm(_id: String!): Cover
`;

export const queries = `
  covers(startDate: Date, endDate: Date, userId: String, page: Int, perPage: Int): [Cover]
  coverDetail(_id: String!): Cover
  coverAmounts(_id: String, endDate: Date): JSON
`;
