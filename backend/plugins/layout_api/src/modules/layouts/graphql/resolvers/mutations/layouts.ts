import { IContext } from '~/connectionResolvers';

export const layoutsMutations = {
  createLayouts: async (_parent: undefined, { doc }, { models }: IContext) => {
    return models.Layouts.createLayouts(doc);
  },

  updateLayouts: async (
    _parent: undefined,
    { _id, doc },
    { models }: IContext,
  ) => {
    return models.Layouts.updateLayouts(_id, doc);
  },

  removeLayouts: async (_parent: undefined, { _id }, { models }: IContext) => {
    return models.Layouts.removeLayouts([_id]);
  },
};
