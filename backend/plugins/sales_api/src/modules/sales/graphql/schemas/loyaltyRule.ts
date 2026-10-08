const placeFields = `
  probability: String
  stageIds: [String]
`;

export const types = `
  type SalesLoyaltyRulePlace {
    ${placeFields}
  }

  input SalesLoyaltyRulePlaceInput {
    ${placeFields}
  }

  type SalesLoyaltyRule {
    _id: String!
    type: String!
    scoreCampaignId: String!
    boardId: String
    pipelineId: String
    earn: SalesLoyaltyRulePlace
    refund: SalesLoyaltyRulePlace
    updatedBy: String
    updatedAt: Date
  }

  input SalesLoyaltyRuleInput {
    _id: String
    type: String!
    scoreCampaignId: String!
    boardId: String
    pipelineId: String
    earn: SalesLoyaltyRulePlaceInput
    refund: SalesLoyaltyRulePlaceInput
  }
`;

export const queries = `
  salesLoyaltyRules: [SalesLoyaltyRule]
`;

export const mutations = `
  salesLoyaltyRulesSave(rules: [SalesLoyaltyRuleInput!]!): [SalesLoyaltyRule]
`;
