export const types = `
  type User {
    _id: String!
    username: String
    details: JSON
    emails: JSON
  }
`;

export const queries = `
  users(limit: Int): [User]
  userDetail(_id: String): User
  totalUsersCount: Int
`;
