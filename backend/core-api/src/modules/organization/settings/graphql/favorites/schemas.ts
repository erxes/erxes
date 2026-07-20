export const types = `
  type Favorite {
    _id: String!
    type: String!
    path: String!
    label: String
  }
`;

export const queries = `
  getFavoritesByCurrentUser: [Favorite]
  isFavorite(type: String!, path: String!, ): Boolean
`;

export const mutations = `
  toggleFavorite(type: String!, path: String!, label: String, ): Favorite
`;
