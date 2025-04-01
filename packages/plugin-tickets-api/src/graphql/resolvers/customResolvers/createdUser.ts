import { IContext } from '../../../connectionResolver';
import { sendCoreMessage } from '../../../messageBroker';

export default {
  async createdUser({ _id }, {}, { subdomain }: IContext) {
    console.log(_id,'akosdpaksdpasd')
    if (!_id) {
      return null;
    }
    const customer = await sendCoreMessage({
      subdomain,
      action: 'customers.findOne',
      data: { _id: _id },
      isRPC: true,
      defaultValue: {},
    });
    return customer;
  },
};
