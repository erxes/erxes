import { IContext } from "../../../connectionResolver";

const neighborMutations = {
  neighborSave: async (
    _root,
    { productCategoryId, info, rate },
    { models }
  ) => {
    const neighbor = await models.Neighbor.findOne({ productCategoryId });

    if (neighbor) {
      return await models.Neighbor.updateNeighbor({
        productCategoryId,
        info,
        rate,
      });
    } else {
      return await models.Neighbor.createNeighbor({
        productCategoryId,
        info,
        rate,
      });
    }
  },

  neighborRemove: async (_root, doc, { user, models }: IContext) => {
    const remove = await models.Neighbor.removeNeighbor(doc);

    return remove;
  },

  neighborItemCreate: async (_root, doc, { models, user }) => {
    const create = await models.NeighborItem.createNeighborItem(doc, user);

    return create;
  },

  neighborItemEdit: async (_root, doc, { user, models }: IContext) => {
    const create = await models.NeighborItem.updateNeighborItem(doc);

    return create;
  },

  neighborItemRemove: async (_root, doc, { docModifier, models }: IContext) => {
    return await models.NeighborItem.removeNeighborItem(docModifier(doc));
  },
};

export default neighborMutations;
