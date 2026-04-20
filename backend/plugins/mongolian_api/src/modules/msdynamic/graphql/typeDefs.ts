import gql from 'graphql-tag';
import { mutations, queries } from './schema/msdynamic';

const types = `
  type SyncMsdHistory {
    _id: String!
    type: String
    contentType: String
    contentId: String
    createdAt: Date
    createdBy: String
    consumeData: JSON
    consumeStr: String
    sendData: JSON
    sendStr: String
    responseData: JSON
    responseStr: String
    sendSales: [String]
    responseSales: [String]
    error: String
    content: String
    createdUser: JSON
  }

  type CheckResponse {
    _id: String
    isSynced: Boolean
    syncedDate: Date
    syncedBillNumber: String
    syncedCustomer: String
  }

  type MsdCustomerRelation {
    _id: String
    brandId: String
    customerId: String
    modifiedAt: Date
    no: String
    response: JSON

    brand: JSON
  }
`;

const typeDefs = async () => {
  return gql`
    scalar JSON
    scalar Date

    ${types}
    
    extend type Query {
      ${queries}
    }
    
    extend type Mutation {
      ${mutations}
    }
  `;
};

export default typeDefs;
