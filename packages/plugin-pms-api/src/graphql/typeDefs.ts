import gql from 'graphql-tag';

const types = `
  type Pms {
    _id: String!
    name: String
    createdAt:Date
    expiryDate:Date
    checked:Boolean
    typeId: String
  
    currentType: PmsType
  }

  type PmsType {
    _id: String!
    name: String
  }
`;

const queries = `
  pmss(typeId: String): [Pms]
  pmsTypes: [PmsType]
  pmssTotalCount: Int
`;

const params = `
  name: String,
  expiryDate: Date,
  checked: Boolean,
  typeId:String
`;

const mutations = `
  pmssAdd(${params}): Pms
  pmssRemove(_id: String!): JSON
  pmssEdit(_id:String!, ${params}): Pms
  pmsTypesAdd(name:String):PmsType
  pmsTypesRemove(_id: String!):JSON
  pmsTypesEdit(_id: String!, name:String): PmsType
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
