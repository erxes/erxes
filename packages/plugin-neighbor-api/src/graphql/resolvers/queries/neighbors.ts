const neighborQueries = {
  getNeighborItems: async (_root, { type }, { models }) => {
    return await models.NeighborItem.find({ type });
  },
  getNeighborItem: async (_root, { _id }, { models }) => {
    return await models.NeighborItem.find({ _id });
  },
  getNeighbor: async (_root, { productCategoryId }, { models }) => {
    return await models.Neighbor.findOne({ productCategoryId });
  }
};

export default neighborQueries;
