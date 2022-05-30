import { IContext } from '../../../connectionResolver';
import { IGetRemainder } from '../../../models/definitions/remainders';
import { sendProductsMessage } from '../../../messageBroker';

export default {
  __resolveReference({ _id }, { models }: IContext) {
    return models.Remainders.findOne({ _id });
  },

  uom(remainder: IGetRemainder, {}, { subdomain }: IContext) {
    return sendProductsMessage({
      subdomain,
      action: 'uoms.findOne',
      data: {
        query: { _id: remainder.uomId }
      }
    });
  }
};
