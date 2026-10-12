import { IContext } from '~/connectionResolvers';

export const productConditionQueries = {
  async productConditions(
    _root: undefined,
    _args: undefined,
    { models }: IContext,
  ) {
    return models.ProductConditions.find().sort({ createdAt: 1 }).lean();
  },
};
