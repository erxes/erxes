export const TypeExtensions = `

  extend type Company @key(fields: "_id") {
    _id: String @external
  }

  extend type Customer @key(fields: "_id") {
    _id: String @external
  }

  extend type Tag @key(fields: "_id") {
    _id: String @external
  }
`;
