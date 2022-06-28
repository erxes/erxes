import { checkPermission } from '@erxes/api-utils/src/permissions';
import { IContext } from '../../../connectionResolver';
import { ISafeRemainder } from '../../../models/definitions/safeRemainders';
import {
  SAFE_REMAINDER_STATUSES,
  SAFE_REMITEM_STATUSES
} from '../../../models/definitions/constants';
import { sendProductsMessage } from '../../../messageBroker';
import { updateLiveRemainder } from './utils';

export interface IUpdateSafeRemItemParams {
  _id: string;
  status?: string;
  remainder: number;
}

const remainderMutations = {
  async createSafeRemainder(
    _root,
    params: ISafeRemainder,
    { models, subdomain, user }: IContext
  ) {
    const {
      productCategoryId,
      date,
      description,
      departmentId,
      branchId
    } = params;
    await updateLiveRemainder({
      subdomain,
      departmentId,
      branchId,
      productCategoryId
    });

    const safeRemainder = await models.SafeRemainders.createRemainder({
      date,
      description,
      departmentId,
      branchId,
      productCategoryId,
      status: SAFE_REMAINDER_STATUSES.DRAFT,
      createdAt: new Date(),
      createdBy: user._id,
      modifiedAt: new Date(),
      modifiedBy: user._id
    });

    const productCategories = await sendProductsMessage({
      subdomain,
      action: 'categories.withChilds',
      data: {
        _id: productCategoryId
      },
      isRPC: true,
      defaultValue: []
    });

    const categoryIds = productCategories.map(p => p._id);

    const products = await sendProductsMessage({
      subdomain,
      action: 'find',
      data: {
        query: { categoryId: { $in: categoryIds } },
        sort: {}
      },
      isRPC: true
    });

    const now = new Date();
    const defaultUomId = '';
    const productIds = products.map(p => p._id);
    const liveRemainders = await models.Remainders.find({
      departmentId,
      branchId,
      productId: { $in: productIds }
    }).lean();

    const bulkOps: any[] = [];

    for (const product of products) {
      const live = liveRemainders.find(l => l.productId === product._id) || {};

      bulkOps.push({
        modifiedAt: now,
        lastTrDate: now,
        remainderId: safeRemainder._id,
        productId: product._id,
        uomId: product.uomId || defaultUomId,
        preCount: live.count || 0,
        count: live.count || 0,
        branchId: safeRemainder.branchId,
        departmentId: safeRemainder.departmentId
      });
    }

    await models.SafeRemItems.insertMany(bulkOps);
    return safeRemainder;
  },

  async removeSafeRemainder(
    _root,
    { _id }: { _id: string },
    { models }: IContext
  ) {
    await models.SafeRemainders.getRemainderObject(_id);

    await models.SafeRemItems.deleteMany({ remainderId: _id });
    //  TODO delete tr

    return models.SafeRemainders.deleteOne({ _id });
  },

  async updateSafeRemItem(
    _root,
    params: IUpdateSafeRemItemParams,
    { models }: IContext
  ) {
    const { _id, status, remainder } = params;
    const item = await models.SafeRemItems.getRemItemObject(_id);

    await models.SafeRemItems.updateOne(
      { _id },
      {
        $set: {
          count: remainder,
          status: status || SAFE_REMITEM_STATUSES.CHECKED
        }
      }
    );

    return models.SafeRemItems.getRemItemObject(_id);
  },

  async removeSafeRemItem(
    _root,
    { _id }: { _id: string },
    { models }: IContext
  ) {
    await models.SafeRemItems.getRemItemObject(_id);

    return models.SafeRemItems.deleteOne({ _id });
  }
};

checkPermission(remainderMutations, 'updateRemainders', 'manageRemainders');

export default remainderMutations;
