import { IContext } from '~/connectionResolvers';

const elementMutations = {
  bmsElementAdd: async (_root, doc, { user, models }: IContext) => {
    return models.Elements.createElement(doc, user);
  },

  bmsElementEdit: async (_root, { _id, ...doc }, { models }: IContext) => {
    const updated = await models.Elements.updateElement(_id, doc as any);
    return updated;
  },

  bmsElementRemove: async (
    _root,
    { ids }: { ids: string[] },
    { models }: IContext,
  ) => {
    return await models.Elements.removeElements(ids);
  },

  bmsElementCategoryAdd: async (_root, doc, { models }: IContext) => {
    return models.ElementCategories.createElementCategory(doc);
  },

  bmsElementCategoryEdit: async (
    _root,
    { _id, ...doc },
    { models }: IContext,
  ) => {
    const updated = await models.ElementCategories.updateElementCategory(
      _id,
      doc as any,
    );
    return updated;
  },

  bmsElementCategoryRemove: async (
    _root,
    { _id }: { _id: string },
    { models }: IContext,
  ) => {
    const removed = await models.ElementCategories.removeElementCategory(_id);

    return removed;
  },
};

export default elementMutations;
