const pipelinesChanged = `
  subscription salesPipelinesChanged($_id: String!) {
    salesPipelinesChanged(_id: $_id) {
      _id
      proccessId
      action
      data
    }
  }
`;

const productsDataChanged = `
  subscription salesProductsDataChanged($_id: String!) {
    salesProductsDataChanged(_id: $_id) {
      _id
      proccessId
      action
      data
    }
  }
`;

export default {
  pipelinesChanged,
  productsDataChanged
};
