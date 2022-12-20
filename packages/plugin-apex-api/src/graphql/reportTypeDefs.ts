export const types = `
  type ApexReport {
    _id: String!

    createdAt: Date
    createdUserId: String

    name: String!
    code: String!
    content: String
  }
`;

const params = `
  limit: Int,
  page: Int,
  perPage: Int,
`;

export const queries = `
  apexReports(${params}): [ApexReport]
  apexReportDetail(_id: String!): ApexReport
`;

export const mutations = `
  apexReportSave(_id: String, name: String!, code: String!, content: String): ApexReport
  apexReportRemove(_id: String!): JSON
`;
