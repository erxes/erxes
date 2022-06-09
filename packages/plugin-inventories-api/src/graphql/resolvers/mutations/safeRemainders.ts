import { checkPermission } from '@erxes/api-utils/src/permissions';
import { IContext } from '../../../connectionResolver';
import { sendProductsMessage } from '../../../messageBroker';
import {
  ISafeRemainder,
  ISafeRemItemDocument
} from '../../../models/definitions/safeRemainders';
import { SAFE_REMAINDER_STATUSES } from '../../../models/definitions/constants';

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

    // const productCategories = await sendProductsMessage({
    //   subdomain,
    //   action: 'categories.withChilds',
    //   data: {
    //     _id: productCategoryId
    //   },
    //   isRPC: true,
    //   defaultValue: []
    // });

    // const categoryIds = productCategories.map(p => p._id);

    // const products = await sendProductsMessage({
    //   subdomain,
    //   action: 'find',
    //   data: {
    //     query: { categoryId: { $in: categoryIds } },
    //     sort: {}
    //   },
    //   isRPC: true
    // });

    return safeRemainder;
  }
};

checkPermission(remainderMutations, 'updateRemainders', 'manageRemainders');

export default remainderMutations;
