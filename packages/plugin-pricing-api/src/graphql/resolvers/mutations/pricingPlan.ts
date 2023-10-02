import { putCreateLog, putDeleteLog, putUpdateLog } from '../../../logUtils';
import { IContext, models } from '../../../connectionResolver';
import {
  IPricingPlan,
  IPricingPlanDocument
} from '../../../models/definitions/pricingPlan';
import {
  moduleCheckPermission,
  moduleRequireLogin
} from '@erxes/api-utils/src/permissions';
import { getSubdomain } from '@erxes/api-utils/src/core';

const PRINING_PLAN = 'pricingPlan';
const pricingPlanMutations = {
  pricingPlanAdd: async (
    _root: any,
    { doc }: { doc: IPricingPlan },
    { models, subdomain, user }: IContext
  ) => {
    const create = await models.PricingPlans.createPlan(doc, user._id);

    await putCreateLog(
      models,
      subdomain,
      { type: PRINING_PLAN, newData: create, object: create },
      user
    );
    return create;
  },

  pricingPlanEdit: async (
    _root: any,
    { doc }: { doc: IPricingPlanDocument },
    { models, user, subdomain }: IContext
  ) => {
    const pricingPlan = await models.PricingPlans.findOne({ _id: doc._id });
    const update = await models.PricingPlans.updatePlan(doc._id, doc, user._id);

    await putUpdateLog(
      models,
      subdomain,
      {
        type: PRINING_PLAN,
        object: pricingPlan,
        newData: doc,
        updatedDocument: update
      },
      user
    );

    return update;
  },

  pricingPlanRemove: async (
    _root: any,
    { id }: { id: string },
    { user, models, subdomain }: IContext
  ) => {
    const pricingPlan = await models.PricingPlans.findOne({ _id: id });
    const removed = await models.PricingPlans.removePlan(id);

    await putDeleteLog(
      models,
      subdomain,
      { type: PRINING_PLAN, object: pricingPlan },
      user
    );
    return removed;
  }
};

moduleRequireLogin(pricingPlanMutations);
moduleCheckPermission(pricingPlanMutations, 'managePricing');

export default pricingPlanMutations;
