const params = `
  externalScoringResponse: JSON,
  restInquiryResponse: JSON,
  score: Float,
  keyword: String,
  reportPurpose: String,
  customerId: String,
  vendor: String
`;

const chechParms = `
  keyword: String,
  reportPurpose: String,
  customerId: String,
  vendor: String
`;
export const  mutations = `
  toSaveBurenScoring( ${params}): JSON
  toCheckScore(${chechParms}): JSON
`;
