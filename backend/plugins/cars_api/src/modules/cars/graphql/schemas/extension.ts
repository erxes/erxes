export const TypeExtensions = `

  extend type Company @key(fields: "_id") {
    _id: ID! @external
  }

  extend type Customer @key(fields: "_id") {
    _id: ID! @external
  }

  extend type Tag @key(fields: "_id") {
    _id: ID! @external
  }
`;
