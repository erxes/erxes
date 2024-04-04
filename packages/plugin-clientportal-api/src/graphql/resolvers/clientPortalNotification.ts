import { IContext } from '../../connectionResolver';
import { sendCoreMessage } from '../../messageBroker';

export default {
  async createdUser(clientPortalNotification, {}, { subdomain }: IContext) {
    return sendCoreMessage({
      subdomain,
      action: 'users.findOne',
      data: { _id: clientPortalNotification.createdUser },
      isRPC: true,
      defaultValue: {}
    });
  }
};
