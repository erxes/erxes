export const TypeExtensions = `
  extend type User @key(fields: "_id") {
    _id: String @external
  }

  extend type Customer @key(fields: "_id") {
    _id: String @external
  }

  extend type Company @key(fields: "_id") {
    _id: String @external
  }

<<<<<<< HEAD
  extend type ClientPortalUser {
    _id: String! @external
  }

  union Owner = User | Customer | Company | ClientPortalUser
=======
  union Owner = User | Customer | Company 
>>>>>>> 7f2bef970911affd6708b384c930d9308b1ef4b0
`;
