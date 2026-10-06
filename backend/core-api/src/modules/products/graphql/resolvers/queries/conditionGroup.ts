import { IContext } from '~/connectionResolvers';

export const productConditionGroupQueries = {
  async productConditionGroups(
    _root: undefined,
    _args: undefined,
    { models }: IContext,
  ) {
    return models.ProductConditionGroups.find().sort({ createdAt: 1 }).lean();
  },
};
