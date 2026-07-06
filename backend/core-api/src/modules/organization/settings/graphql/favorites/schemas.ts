export const types = `
  type Favorite {
    _id: String!
    path: String!
    breadcrumb: [String]
  }
`;

export const queries = `
  getFavoritesByCurrentUser: [Favorite]
  isFavorite(path: String!): Boolean
`;

export const mutations = `
  toggleFavorite(path: String!, breadcrumb: [String!]): Favorite
`;
