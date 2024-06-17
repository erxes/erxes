export const types = `
  type burenCustomerScoring {
    _id: String,
    externalScoringResponse: JSON,
    score: Float,
    customerId: String,
    reportPurpose: String,
    keyword: String,
    restInquiryResponse: JSON,
    createdAt: Date,
    createdBy: String
  }

  type burenCustomerScoringsMainResponce {
    list: [burenCustomerScoring],
    totalCount: Float,
  }
`;
const queryParams = `
  page: Int,
  perPage: Int,
  sortField: String,
  sortDirection: Int,
  startDate: Date,
  endDate: Date,
  customerId: String,
  reportPurpose: String
`;
const scoringParams = `
  keyword: String,
  reportPurpose: String
`;

export const queries = `
  burenCustomerScoringsMain(${queryParams}): burenCustomerScoringsMainResponce
  getCustomerScore(customerId: String!): burenCustomerScoring
  getCustomerScoring(${scoringParams}): JSON
  getRegister(customerId: String!): JSON
`;