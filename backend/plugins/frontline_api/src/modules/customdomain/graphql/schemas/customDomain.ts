export const types = `
  type FrontlineCustomDomainRecord {
    type: String!
    name: String!
    value: String!
    status: String!
  }

  type FrontlineCustomDomain {
    isAvailable: Boolean!
    cnameTarget: String!
    hostname: String
    status: String
    sslStatus: String
    dnsStatus: String
    isActive: Boolean!
    verificationErrors: [String]
    lastCheckedAt: Date
    records: [FrontlineCustomDomainRecord!]!
  }
`;

export const queries = `
  frontlineCustomDomain(helpCenterId: String!): FrontlineCustomDomain
`;

export const mutations = `
  frontlineCustomDomainSave(helpCenterId: String!, hostname: String!): FrontlineCustomDomain
  frontlineCustomDomainRefresh(helpCenterId: String!): FrontlineCustomDomain
  frontlineCustomDomainReset(helpCenterId: String!): FrontlineCustomDomain
`;
