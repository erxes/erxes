import { IContext } from '~/connectionResolvers';

export const uomQueries = {
  /**
   * Uoms list
   */
  async uoms(_parent: undefined, _args: undefined, { models }: IContext) {
    return models.Uoms.find({}).sort({ order: 1 }).lean();
  },

  /**
   * Get all uoms count. We will use it in pager
   */
  async uomsTotalCount(
    _parent: undefined,
    _args: undefined,
    { models }: IContext,
  ) {
    return models.Uoms.countDocuments();
  },
};
