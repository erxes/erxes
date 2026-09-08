export const types = `
  type HrmSeniorityRuleBracket {
    minMonths: Int!
    maxMonths: Int
    value: Float!
  }

  type HrmSeniorityRule {
    _id: String!
    code: String!
    name: String!
    description: String
    valueType: String!
    brackets: [HrmSeniorityRuleBracket]
    status: String!
    effectiveDate: Date
    expiryDate: Date
    createdAt: Date
    updatedAt: Date
  }
`;

export const inputs = `
  input HrmSeniorityRuleBracketInput {
    minMonths: Int!
    maxMonths: Int
    value: Float!
  }

  input HrmSeniorityRuleInput {
    code: String!
    name: String!
    description: String
    valueType: String!
    brackets: [HrmSeniorityRuleBracketInput!]!
    status: String
    effectiveDate: Date
    expiryDate: Date
  }
`;

export const queries = `
  hrmSeniorityRuleDetail(_id: String!): HrmSeniorityRule
  hrmSeniorityRuleByCode(code: String!): HrmSeniorityRule
  hrmSeniorityRules(status: String, searchValue: String, page: Int, perPage: Int): [HrmSeniorityRule]
  hrmSeniorityRulesCount(status: String, searchValue: String): Int
`;

export const mutations = `
  hrmSeniorityRulesCreate(doc: HrmSeniorityRuleInput!): HrmSeniorityRule
  hrmSeniorityRulesUpdate(_id: String!, doc: HrmSeniorityRuleInput!): HrmSeniorityRule
  hrmSeniorityRulesArchive(_id: String!): HrmSeniorityRule
  hrmSeniorityRulesRemove(_id: String!): String
`;
