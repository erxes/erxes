export const mutations = `
  mnConfigsCreate(
    code: String!
    subId: String
    value: JSON
  ): MNConfig

  mnConfigsUpdate(
    _id: String!
    subId: String
    value: JSON
  ): MNConfig

  mnConfigsRemove(
    _id: String!
  ): String
`;

export default mutations;