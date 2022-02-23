const importHistoriesRemove = `
  mutation importHistoriesRemove($_id: String!) {
    importHistoriesRemove(_id: $_id)
  }
`;

const importCancel = `
  mutation importHistoriesCancel($_id: String!) {
    importHistoriesCancel(_id: $_id)
  }
`;

export default {
  importHistoriesRemove,
  importCancel
};
