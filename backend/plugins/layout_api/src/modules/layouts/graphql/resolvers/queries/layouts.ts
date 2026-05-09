import { IContext } from '~/connectionResolvers';

export const layoutsQueries = {
  getLayouts: async (_parent: undefined, { _id }, { models }: IContext) => {
    return models.Layouts.getLayouts(_id);
  },

  getLayoutsBySlug: async (
    _parent: undefined,
    { slug },
    { models }: IContext,
  ) => {
    return models.Layouts.findOne({ slug }).lean();
  },

  getLayoutss: async (_parent: undefined, _args, { models }: IContext) => {
    return models.Layouts.getLayoutss();
  },
};
