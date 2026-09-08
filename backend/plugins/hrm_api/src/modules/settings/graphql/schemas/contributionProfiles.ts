export const types = `
  type HrmContributionComponent {
    code: String!
    name: String!
    side: String!
    rate: Float!
    accountId: String
    reportCode: String
  }

  type HrmContributionProfile {
    _id: String!
    code: String!
    name: String!
    description: String
    employeeRate: Float!
    employerRate: Float!
    employeeCap: Float
    employerCap: Float
    minBase: Float
    maxBase: Float
    components: [HrmContributionComponent]
    status: String!
    effectiveDate: Date
    expiryDate: Date
    createdAt: Date
    updatedAt: Date
  }
`;

export const inputs = `
  input HrmContributionComponentInput {
    code: String!
    name: String!
    side: String!
    rate: Float!
    accountId: String
    reportCode: String
  }

  input HrmContributionProfileInput {
    code: String!
    name: String!
    description: String
    employeeRate: Float!
    employerRate: Float!
    employeeCap: Float
    employerCap: Float
    minBase: Float
    maxBase: Float
    components: [HrmContributionComponentInput]
    status: String
    effectiveDate: Date
    expiryDate: Date
  }
`;

export const queries = `
  hrmContributionProfileDetail(_id: String!): HrmContributionProfile
  hrmContributionProfileByCode(code: String!): HrmContributionProfile
  hrmContributionProfiles(status: String, searchValue: String, page: Int, perPage: Int): [HrmContributionProfile]
  hrmContributionProfilesCount(status: String, searchValue: String): Int
`;

export const mutations = `
  hrmContributionProfilesCreate(doc: HrmContributionProfileInput!): HrmContributionProfile
  hrmContributionProfilesUpdate(_id: String!, doc: HrmContributionProfileInput!): HrmContributionProfile
  hrmContributionProfilesArchive(_id: String!): HrmContributionProfile
  hrmContributionProfilesRemove(_id: String!): String
`;
