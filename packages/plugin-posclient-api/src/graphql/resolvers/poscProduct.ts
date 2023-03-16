import { IContext } from '../../connectionResolver';
import { customFieldsDataByFieldCode } from '@erxes/api-utils/src/fieldUtils';
import { sendCommonMessage } from '../../messageBroker';
import { IProductDocument } from '../../models/definitions/products';

export default {
  customFieldsDataByFieldCode(
    product: IProductDocument,
    _,
    { subdomain }: IContext
  ) {
    return customFieldsDataByFieldCode(product, subdomain, sendCommonMessage);
  },

  async unitPrice(product: IProductDocument, _args, { config }: IContext) {
    return (product.prices || {})[config.token] || 0;
  }
};
