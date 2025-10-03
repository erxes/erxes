const extendTypes = `
  extend type User @key(fields: "_id") {
    _id: String @external
  }

  extend type ProductCategory @key(fields: "_id") {
    _id: String @external
  }
`;

export default extendTypes;
