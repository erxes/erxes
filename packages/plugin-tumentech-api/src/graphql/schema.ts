export const types = `
  type Tumentech {
    _id: String!
    name: String
    createdAt:Date
    expiryDate:Date
    checked:Boolean
    typeId: String
  
    currentType: TumentechType
  }

  type TumentechType {
    _id: String!
    name: String
  }
`;
export const queries = `
  tumentechs(typeId: String): [Tumentech]
  tumentechTypes: [TumentechType]
  tumentechsTotalCount: Int
`;

const params = `
  name: String,
  expiryDate: Date,
  checked: Boolean,
  typeId:String
`;

export const mutations = `
  tumentechsAdd(${params}): Tumentech
  tumentechsRemove(_id: String!): JSON
  tumentechsEdit(_id:String!, ${params}): Tumentech
  tumentechTypesAdd(name:String):TumentechType
  tumentechTypesRemove(_id: String!):JSON
  tumentechTypesEdit(_id: String!, name:String): TumentechType
`;
