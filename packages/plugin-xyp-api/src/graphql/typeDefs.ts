import gql from 'graphql-tag';

const types = `
  type XypSubData {
    serviceName: String
    data: JSON
  }

  type XypData @key(fields: "_id") {
    _id: String
    contentType: String
    contentTypeId: String
    customerId: String
    data: [XypSubData]
    createdAt: Date
    updatedAt: Date
    createdBy: String
    updatedBy: String
  }

  type XypSyncRule @key(fields: "_id") {
    _id: String!
    title: String
    serviceName: String
    responseKey: String
    extractType: String
    extractKey: String

    objectType: String
    fieldGroup: String
    formField: String

    createdBy: String
    createdAt: Date
    updatedBy: String
    updatedAt: Date

    fieldGroupObj: JSON
    formFieldObj: JSON
  }
`;

const params = `
  contentType: String
  contentTypeId: String
  customerId: String
  data: JSON
`;

const syncRuleParams = `
  title: String
  serviceName: String
  responseKey: String
  extractType: String
  extractKey: String

  objectType: String
  fieldGroup: String
  formField: String
`;

const syncRulesFilterParams = `
  serviceName: String,
  responseKey: String,
  objectType: String,
  fieldGroup: String,
  formField: String,
  title: String,
  page: Int,
  perPage: Int,
  sortField: String,
  sortDirection: Int,
`

const queries = `
  xypServiceList(url:String, token:String): JSON
  xypServiceListChoosen: JSON
  xypRequest(params:JSON, wsOperationName:String!): JSON
  xypDataList(contentType:String, contentTypeIds:[String], customer: String): [XypData]
  xypDataDetail(_id: String, contentType: String, contentTypeId: String): XypData
  xypDataByObject(contentType: String, contentTypeId: String): [XypData]
  checkXypData(contentType: String, contentTypeId: String, customerId: String, serviceName: String): XypData

  xypSyncRules(${syncRulesFilterParams}): [XypSyncRule]
  xypSyncRulesCount(${syncRulesFilterParams}): Int
  xypSyncRuleDetail(_id: String!): XypSyncRule
`;

const mutations = `
  xypDataAdd(${params}): XypData
  xypDataUpdate( _id: String!, ${params}): XypData
  danDataAdd(${params}): XypData

  xypSyncRuleAdd(${syncRuleParams}): XypSyncRule
  xypSyncRuleEdit(_id: String, ${syncRuleParams}): XypSyncRule
  xypSyncRuleRemove(_id: String): String
`;

const typeDefs = async () => {
  return gql`
    scalar JSON
    scalar Date
    extend type Query {
      ${queries}
    }
    extend type Mutation {
      ${mutations}
    }
    ${types}
  `;
};

export default typeDefs;
