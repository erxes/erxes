export const types = `
  type ApexReport {
    _id: String!

    createdAt: Date
    createdUserId: String

    type: String!
    name: String!
    code: String!
    content: String
    companyId: String
    company: Company
  }
`;

const params = `
  type: String,
  companyId: String,
  limit: Int,
  page: Int,
  perPage: Int,
`;

export const queries = `
  apexReports(${params}): [ApexReport]
  apexReportDetail(_id: String, code: String): ApexReport
  apexCompanyDetail(companyId: String!): Company
  apexCompanies: [Company]
`;

export const mutations = `
  apexReportSave(_id: String, type: String!, name: String!, code: String!, content: String, companyId: String!): ApexReport
  apexReportRemove(_id: String!): JSON
`;
