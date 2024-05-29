import { IContext } from '../../connectionResolver';
import { sendCoreMessage } from '../../messageBroker';
import { IGrantResponse } from '../../models/definitions/grant';

export default {
  __resolveReference({ _id }, { models }: IContext) {
    return models.Responses.findOne({ _id });
  },

  async user(
    { userId }: { _id: string } & IGrantResponse,
    {},
    { subdomain }: IContext
  ) {
    if (!userId) {
      return null;
    }

    const user = await sendCoreMessage({
      subdomain,
      action: 'users.findOne',
      data: {
        _id: { $in: userId }
      },
      isRPC: true,
      defaultValue: null
    });

    return user;
  }
};
