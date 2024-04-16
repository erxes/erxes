import gql from 'graphql-tag';

const types = `
  type Burenscoring {
    _id: String!
    name: String
    createdAt:Date
    expiryDate:Date
    checked:Boolean
    typeId: String
  
    currentType: BurenscoringType
  }

  type BurenscoringType {
    _id: String!
    name: String
  }
`;

const queries = `
  burenscorings(typeId: String): JSON
  burenscoringsTotalCount: Int
`;

const params = `
externalScoringResponse: JSON,
restInquiryResponse: JSON
`;

const mutations = `
  burenscoringsAdd(_id: String): JSON
  burenscoringsRemove(_id: String!): JSON
  burenscoringsEdit(_id:String!, ${params}): Burenscoring
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
