import { IContext } from '../../../connectionResolver';
import { sendProductsMessage } from '../../../messageBroker';
import { ISafeRemItemDocument } from '../../../models/definitions/safeRemainders';

export default {
  async product(safeRemItem: ISafeRemItemDocument, _, { subdomain }: IContext) {
    return sendProductsMessage({
      subdomain,
      action: 'findOne',
      data: {
        _id: safeRemItem.productId
      },
      isRPC: true
    });
  },

  async uom(safeRemItem: ISafeRemItemDocument, _, { subdomain }: IContext) {
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
  }
};
