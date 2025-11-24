const extendTypes = `

  extend type ProductCategory @key(fields: "_id") {
    _id: String! @external
  }
`;

export default extendTypes;
