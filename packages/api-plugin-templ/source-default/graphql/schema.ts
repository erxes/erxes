export const types = `
  type {Name} {
    _id: String!
    name: String
    createdAt:Date
    expiryDate:Date
    checked:Boolean
    typeId: String
  
    currentType: {Name}Type
  }

  type {Name}Type {
    _id: String!
    name: String
  }
`;
export const queries = `
  {name}s(typeId: String): [{Name}]
  {name}Types: [{Name}Type]
  {name}sTotalCount: Int
`;

const params = `
  name: String,
  expiryDate: Date,
  checked: Boolean,
  typeId:String
`;

export const mutations = `
  {name}sAdd(${params}): {Name}
  {name}sRemove(_id: String!): JSON
  {name}sEdit(_id:String!, ${params}): {Name}
  {name}TypesAdd(name:String):{Name}Type
  {name}TypesRemove(_id: String!):JSON
  {name}TypesEdit(_id: String!, name:String): {Name}Type
`;
