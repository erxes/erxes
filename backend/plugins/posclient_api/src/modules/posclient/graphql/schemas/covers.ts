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
    note: String

    user: PosUser
    createdUser: PosUser
    modifiedUser: PosUser
  }
      type PosCover {
    _id: String
    posToken: String
    status: String
    beginDate: Date
    endDate: Date
    description: String
    userId: String
    details: [PosCoverDetail] 
    createdAt: Date
    createdBy: String
    modifiedAt: Date
    modifiedBy: String
    note: String
  }
  type PosCoverDetail {
  _id: String
  paidType: String
  paidSummary: [PosCoverSummary] 
  paidDetail: JSON
}
  type PosCoverSummary {
  _id: String
  kind: String
  kindOfVal: Float
  value: Float
  amount: Float
}
`;

const coverParams = `
  status: String
  beginDate: Date
  endDate: Date
  description: String
  userId: String
  details: JSON
`;

export const mutations = `
  coversAdd(${coverParams}): Cover
  coversEdit(_id: String!, ${coverParams}): Cover
  coversRemove(_id: String!): JSON
  coversConfirm(_id: String!): Cover
`;

export const queries = `
  covers(startDate: Date, endDate: Date, userId: String, page: Int, perPage: Int): [Cover]
  coverDetail(_id: String!): Cover
  coverAmounts(_id: String, endDate: Date): JSON
  posCovers(startDate: Date, endDate: Date, userId: String, page: Int, perPage: Int): [PosCover]
`;
