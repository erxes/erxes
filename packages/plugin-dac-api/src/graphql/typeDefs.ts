import gql from 'graphql-tag';

const types = `
  type Dac {
    _id: String!
    name: String
    createdAt:Date
    expiryDate:Date
    checked:Boolean
    typeId: String
  
    currentType: DacType
  }

  type DacType {
    _id: String!
    name: String
  }

  type DacCupon {
     _id: String!,
     customerId: String!,
     cuponCode: String,
     description: String,
     startDate: Date,
     expiryDate: Date,
     status: String,
     title: String,
     discount: String
   }
     input DacCuponInput {
     customerId: String!,
     cuponCode: String,
     description: String,
     startDate: Date,
     expireDate: Date,
     title: String,
     discount: String
   },
`;

const queries = `
  dac(typeId: String): [Dac]
  dacTypes: [DacType]
  dacTotalCount: Int,
  dacCuponCheck(customerId: String!, _id: String!): String
  dacUserActiveCupons: [DacCupon]
`;

const params = `
  name: String,
  expiryDate: Date,
  checked: Boolean,
  typeId:String
`;

const mutations = `
  dacAdd(${params}): Dac
  dacRemove(_id: String!): JSON
  dacEdit(_id:String!, ${params}): Dac
  dacTypesAdd(name:String):DacType
  dacTypesRemove(_id: String!):JSON
  dacTypesEdit(_id: String!, name:String): DacType
  dacCuponAdd(doc: DacCuponInput!): String
  dacCuponUse(status: String, customerId: String, _id: String!): String
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
