export const types = `
  type PosCoverSummary {
    _id: String
    kind: String
    kindOfVal: Float
    value: Float
    amount: Float
  }

  type PosCoverDetail {
    _id: String
    paidType: String
    
    paidSummary: [PosCoverSummary]
    paidDetail: JSON
  }

  type PosCover {
    _id: String
    posToken: String
    beginDate: Date
    endDate: Date
    status: String
    description: String
    userId: String
    details: [PosCoverDetail]
    createdAt: Date
    createdBy: String
    modifiedAt: Date
    modifiedBy: String
    note: String

    posName: String
    user: User
    createdUser:  User
    modifiedUser:  User
  }
`;

const queryParams = `
  page: Int
  perPage: Int
  sortField: String
  sortDirection: Int
  startDate: Date
  endDate: Date
  userId: String
  posId: String
  posToken: String
`;

export const mutations = `
  posCoversEdit(_id: String!, note: String): PosCover
  posCoversRemove(_id: String!): JSON
`;

export const queries = `
  posCovers(${queryParams}): [PosCover]
  posCoversCount(${queryParams}): Int
  posCoverDetail(_id: String!): PosCover
`;
