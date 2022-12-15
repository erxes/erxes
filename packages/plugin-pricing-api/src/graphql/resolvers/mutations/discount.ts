import { IContext, models } from '../../../connectionResolver';
import {
  IDiscount,
  IDiscountDocument
} from '../../../models/definitions/discount';
import {
  moduleCheckPermission,
  moduleRequireLogin
} from '@erxes/api-utils/src/permissions';

const discountMutations = {
  discountAdd: async (
    _root: any,
    { doc }: { doc: IDiscount },
    { models, user }: IContext
  ) => {
    return await models.Discounts.discountAdd(doc, user._id);
  },

  discountEdit: async (
    _root: any,
    { doc }: { doc: IDiscountDocument },
    { models, user }: IContext
  ) => {
    return await models.Discounts.discountEdit(doc._id, doc, user._id);
  },

  discountRemove: async (
    _root: any,
    { id }: { id: string },
    { models }: IContext
  ) => {
    return await models.Discounts.discountRemove(id);
  }
};

moduleRequireLogin(discountMutations);
moduleCheckPermission(discountMutations, 'managePricing');

export default discountMutations;
