import gql from 'graphql-tag';

const types = `

  extend type User @key(fields: "_id") {
      _id: String! @external
  }

  extend type Customer @key(fields: "_id") {
      _id: String! @external
  }

  type Sample {
    _id: String!
    name: String
    createdAt:Date
    activeCustomers: [Customer]
    expiryDate:Date
    checked:Boolean
    typeId: String
  
    currentType: SampleType
  }

  type SampleType {
    _id: String!
    name: String
  }
`;

const queries = `
  samples(typeId: String): [Sample]
  sampleTypes: [SampleType]
  samplesTotalCount: Int
`;

const params = `
  name: String,
  expiryDate: Date,
  checked: Boolean,
  typeId:String
`;

const mutations = `
  samplesAdd(${params}): Sample
  samplesRemove(_id: String!): JSON
  samplesEdit(_id:String!, ${params}): Sample
  sampleTypesAdd(name:String):SampleType
  sampleTypesRemove(_id: String!):JSON
  sampleTypesEdit(_id: String!, name:String): SampleType
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
