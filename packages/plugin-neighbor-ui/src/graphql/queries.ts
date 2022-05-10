const getNeighborItems = `
  query getNeighborItems($type:String) {
    getNeighborItems(type: $type)
  }
`;

const getNeighborItem = `
  query getNeighborItem($_id:String) {
    getNeighborItem(_id: $_id)
  }
`;

const getNeighbor = `
  query getNeighbor($productCategoryId:String!) {
    getNeighbor(productCategoryId: $productCategoryId) {
      productCategoryId
      data
      rate
    }
  }
`;

export default { getNeighborItems, getNeighborItem, getNeighbor };
