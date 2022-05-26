import { IContext } from '../../../connectionResolver';
import { IGetRemainder } from '../../../models/definitions/remainders';
import { sendProductsMessage } from '../../../messageBroker';

export default {
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
