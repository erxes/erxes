import { gql } from 'apollo-server-express';

const params = `
  type: String,
  companyId: String,
  limit: Int,
  page: Int,
  perPage: Int,
`;

const typeDefs = gql`
  scalar JSON
  scalar Date

  extend type Company @key(fields: "_id") {
    _id: String! @external
  }

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

  type ApexStory {
    _id: String!

    createdAt: Date

    title: String!
    content: String
    companyId: String
    company: Company
  }

  extend type Query {
    apexReports(${params}): [ApexReport]
    apexReportDetail(_id: String, code: String): ApexReport
    apexCompanyDetail(companyId: String!): Company
    apexCompanies(search: String): [Company]

    apexStories(${params}): [ApexStory]
    apexStoryDetail(_id: String): ApexStory
    apexStoryIsReadByUser(_id: String): Boolean
  }

  extend type Mutation {
    apexReportSave(_id: String, type: String!, name: String!, code: String!, content: String, companyId: String!): ApexReport
    apexReportRemove(_id: String!): JSON

    apexStorySave(_id: String, title: String!, content: String, companyId: String!): ApexStory
    apexStoryRemove(_id: String!): JSON
    apexStoryRead(_id: String!): JSON
  }
`;

export default typeDefs;
