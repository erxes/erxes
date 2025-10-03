import { IContext } from '~/connectionResolvers';

export const configQueries = {
  /**
   * ProductConfig object
   */
  async productsConfigs(
    _parent: undefined,
    _args: undefined,
    { models }: IContext,
  ) {
    return await models.ProductsConfigs.find({});
  },
};
