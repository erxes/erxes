export const types = `
  type Company {
    _id: String!
    name: String
    size: Int
    website: String
    industry: String
    plan: String
    lastSeenAt: Date
    sessionCount: Int
    tagIds: [String],
  }
`;

const commonFields = `
  name: String!,
  size: Int,
  website: String,
  industry: String,
  plan: String,
  lastSeenAt: Date,
  sessionCount: Int,
  tagIds: [String]
`;

export const mutations = `
  companiesAdd(${commonFields}): Company
  companiesEdit(_id: String!, ${commonFields}): Company
  companiesRemove(_id: String!): Company
`;
