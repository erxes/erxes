export const types = `
  type Score {
    _id: String
    name: String
    description: String
  }
`;

export const queries = `
  getScore(_id: String!): Score
  getScores: [Score]
`;

export const mutations = `
  createScore(name: String!): Score
  updateScore(_id: String!, name: String!): Score
  removeScore(_id: String!): Score
`;
