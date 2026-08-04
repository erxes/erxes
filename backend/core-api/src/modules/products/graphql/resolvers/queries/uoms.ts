import { Resolver } from 'erxes-api-shared/core-types';
import { IContext } from '~/connectionResolvers';

export const uomQueries: Record<string, Resolver<any, any, IContext>> = {
  /**
   * Uoms list
   */
  async uoms(_parent: undefined, _args: undefined, { models }: IContext) {
    return models.Uoms.find({}).sort({ order: 1 }).lean();
  },

  async cpUoms(_parent: undefined, _args: undefined, { models }: IContext) {
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

uomQueries.cpUoms.wrapperConfig = {
  forClientPortal: true,
};
