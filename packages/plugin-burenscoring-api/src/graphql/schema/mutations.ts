const params = `
externalScoringResponse: JSON,
restInquiryResponse: JSON,
score: Float,
keyword: String,
reportPurpose: String
`;

export const  mutations = `
  toSaveBurenScoring( ${params}): JSON
`;