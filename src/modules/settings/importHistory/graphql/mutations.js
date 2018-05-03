const importHistoriesRemove = `
  mutation importHistoriesRemove($_id: String!) {
    importHistoriesRemove(_id: $_id)
  }
`;

export default {
  importHistoriesRemove
};
