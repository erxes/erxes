import gql from 'graphql-tag';

const types = `
  type XypData {
    _id: String!
    contentType: String
    contentTypeId: String
    data: JSON
    createdAt:Date
    updatedAt:Date
  }
`;

const params = `
contentType: String
contentTypeId: String
data: JSON
`;

const queries = `
  xypServiceList(url:String, token:String):JSON
  xypServiceListChoosen:JSON
  xypRequest(params:JSON,wsOperationName:String!):JSON
  xypDataList(contentType:String,contentTypeIds:[String]):[XypData]
  xypDataDetail(_id: String, contentType: String, contentTypeId: String): XypData
`;

const mutations = `
  xypDataAdd(${params}):XypData
  xypDataUpdate( _id: String!,${params}):XypData
`;

const typeDefs = async _serviceDiscovery => {
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
