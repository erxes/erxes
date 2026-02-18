

export const types = `
 type AutoNumbering @key(fields: "_id") @cacheControl(maxAge: 3) {
   _id: String!
   module: String!
   pattern: String!
   fractionalPart: Int
   lastNumber: Int
   createdAt: Date
 }
`;


export const queries = `
 autoNumbering(module: String!): AutoNumbering
 autoNumberings: [AutoNumbering]!
`;


export const mutations = `
 saveAutoNumbering(
   module: String!
   pattern: String!
   fractionalPart: Int!
 ): AutoNumbering


 generateAutoNumber(module: String!): String


 autoNumberingRemove(_id: String!): String  # <-- add
`;


