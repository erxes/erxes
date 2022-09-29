import { IContext } from '../../../connectionResolver';
import { sendProductsMessage } from '../../../messageBroker';
import { IRemainderDocument } from '../../../models/definitions/remainders';

export default {
  async uom(product: any, _, {}: IContext) {
    return { _id: '465', code: '1', name: 'aa' };
    // if (!(await models.ProductsConfigs.getConfig('isReqiureUOM', ''))) {
    //   return {};
    // }

    // let uomId = product.uomId;
    // if (!uomId) {
    //   uomId = await models.ProductsConfigs.getConfig('default_uom', '');
    // }

    // if (!uomId) {
    //   return {};
    // }

    // return models.Uoms.getUom({ _id: uomId });
  },

  async category(remainder: any, _, { subdomain }: IContext) {
    return sendProductsMessage({
      subdomain,
      action: 'categories.findOne',
      data: {
        _id: remainder.categoryId
      },
      isRPC: true
    });
  }
};
