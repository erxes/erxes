import { IContext } from '../../../connectionResolver';
import {
  moduleCheckPermission,
  moduleRequireLogin
} from '@erxes/api-utils/src/permissions';
import { paginate } from '@erxes/api-utils/src';
import { IPricingPlanDocument } from '../../../models/definitions/pricingPlan';
import { checkPricing } from '../../../utils';

const checkPricingQueries = {
  checkPricing: async (
    _root: any,
    params: any,
    { subdomain, models }: IContext
  ) => {
    const {
      prioritizeRule,
      totalAmount,
      departmentId,
      branchId,
      products
    } = params;

    return await checkPricing(
      models,
      subdomain,
      prioritizeRule,
      totalAmount,
      departmentId,
      branchId,
      products
    );
  }
};

moduleRequireLogin(checkPricingQueries);
moduleCheckPermission(checkPricingQueries, 'showPricing');

export default checkPricingQueries;
