import {
  checkPermission,
  requireLogin
} from '@erxes/api-utils/src/permissions';
import { serviceDiscovery } from '../../../configs';
import { IContext } from '../../../connectionResolver';
import { sendProductsMessage } from '../../../messageBroker';
import { IRemainderParams } from '../../../models/definitions/remainders';

const remainderQueries = {
  async remainders(
    _root,
    {
      departmentId,
      branchId,
      productCategoryId
    }: { departmentId: string; branchId: string; productCategoryId: string },
    { models, commonQuerySelector, subdomain }: IContext
  ) {
    const selector: any = { ...commonQuerySelector, departmentId, branchId };

    if (productCategoryId) {
      const products = await sendProductsMessage({
        subdomain,
        action: 'find',
        data: {
          query: {},
          categoryId: productCategoryId
        },
        isRPC: true
      });

      selector.productId = { $in: products.map(p => p._id) };
    }

    return models.Remainders.find(selector).lean();
  },

  /**
   * Get one tag
   */
  remainderDetail(_root, { _id }: { _id: string }, { models }: IContext) {
    return models.Remainders.findOne({ _id });
  },

  getRemainder(_root, params: IRemainderParams, { models }: IContext) {
    return models.Remainders.getRemainder(params);
  }
};

requireLogin(remainderQueries, 'tagDetail');
checkPermission(remainderQueries, 'remainders', 'showTags', []);

export default remainderQueries;
