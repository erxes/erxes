export const types = `
  type Lottery {
    _id: String
    name: String
    description: String
  }
`;

export const queries = `
  getLottery(_id: String!): Lottery
  getLotteries: [Lottery]
`;

export const mutations = `
  createLottery(name: String!): Lottery
  updateLottery(_id: String!, name: String!): Lottery
  removeLottery(_id: String!): Lottery
`;
