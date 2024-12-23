export const types = () => `

  extend type User @key(fields: "_id") {
    _id: String! @external
  }

  type AD {
    _id: String!
    createdAt: Date
    modifiedAt: Date
  }
`;
