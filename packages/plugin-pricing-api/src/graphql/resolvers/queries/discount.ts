import { IContext } from '../../../connectionResolver';
import {
  moduleCheckPermission,
  moduleRequireLogin
} from '@erxes/api-utils/src/permissions';

const discountQueries = {
  discounts: async (
    _root: any,
    { status }: { status: string },
    { models }: IContext
  ) => {
    let filter: any = {};

    if (status && status.length !== 0) filter.status = status;

    return await models.Discounts.find(filter).lean();
  },

  discountDetail: async (
    _root: any,
    { id }: { id: string },
    { models }: IContext
  ) => {
    return await models.Discounts.findById(id);
  }
};

moduleRequireLogin(discountQueries);
moduleCheckPermission(discountQueries, 'showPricing');

export default discountQueries;
