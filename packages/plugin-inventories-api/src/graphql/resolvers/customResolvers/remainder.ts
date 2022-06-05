import { IContext } from '../../../connectionResolver';
import { IGetRemainder } from '../../../models/definitions/remainders';
import { sendProductsMessage } from '../../../messageBroker';

export default {
  async uom(product: any, _, {}: IContext) {
    console.log('ddddddddddddddd');
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
