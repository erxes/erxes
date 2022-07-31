import { IContext } from '../../../connectionResolver';
import { sendProductsMessage } from '../../../messageBroker';
import { ISafeRemainderItemDocument } from '../../../models/definitions/safeRemainderItems';

export default {
  async product(
    safeRemainderItem: ISafeRemainderItemDocument,
    _,
    { subdomain }: IContext
  ) {
    return sendProductsMessage({
      subdomain,
      action: 'findOne',
      data: {
        _id: safeRemainderItem.productId
      },
      isRPC: true
    });
  },

  async uom(
    safeRemainderItem: ISafeRemainderItemDocument,
    _,
    { subdomain }: IContext
  ) {
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
