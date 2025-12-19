export const TypeExtensions = `
  extend type User @key(fields: "_id") {
    _id: String! @external
  }

  extend type Customer @key(fields: "_id") {
    _id: String! @external
  }

  extend type Company @key(fields: "_id") {
    _id: String! @external
  }

  extend type ClientPortalUser {
    _id: String! @external
  }

  union Owner = User | Customer | Company | ClientPortalUser
`;
