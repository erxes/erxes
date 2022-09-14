export const types = `
  type Test {
    _id: String!
    name: String
    createdAt:Date
    expiryDate:Date
    checked:Boolean
    typeId: String
  
    currentType: Type
  }

  type Type {
    _id: String!
    name: String
  }
`;
export const queries = `
  tests(typeId: String): [Test]
  types: [Type]
  testsTotalCount: Int
`;

const params = `
  name: String,
  expiryDate: Date,
  checked: Boolean,
  typeId:String
`;

export const mutations = `
  testsAdd(${params}): Test
  testsRemove(_id: String!): JSON
  testsEdit(_id:String!, ${params}): Test
  typesAdd(name:String):Type
  typesRemove(_id: String!):JSON
  typesEdit(_id: String!, name:String): Type
`;
