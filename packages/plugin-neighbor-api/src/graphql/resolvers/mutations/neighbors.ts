const neighborMutations = {
  neighborSave: async (
    _root,
    { productCategoryId, info },
    { user, models }
  ) => {
    const neighbor = await models.Neighbor.findOne({ productCategoryId });

    if (neighbor) {
      return await models.Neighbor.updateNeighbor(
        models,
        { productCategoryId, info },
        user
      );
    } else {
      return await models.Neighbor.createNeighbor(
        models,
        { productCategoryId, info },
        user
      );
    }
  },

  neighborRemove: async (_root, doc, { user, docModifier, models }) => {
    const remove = await models.Neighbor.removeNeighbor(
      models,
      docModifier(doc),
      user
    );

    return remove;
  },

  neighborItemCreate: async (_root, doc, { user, docModifier, models }) => {
    console.log("heloooo", doc);
    const create = await models.NeighborItem.createNeighborItem(
      models,
      docModifier(doc),
      user
    );

    return create;
  },

  neighborItemEdit: async (_root, doc, { user, docModifier, models }) => {
    const create = await models.NeighborItem.updateNeighborItem(
      models,
      docModifier(doc),
      user
    );

    return create;
  },

  neighborItemRemove: async (_root, doc, { user, docModifier, models }) => {
    return await models.NeighborItem.removeNeighborItem(
      models,
      docModifier(doc),
      user
    );
  },
};

export default neighborMutations;
