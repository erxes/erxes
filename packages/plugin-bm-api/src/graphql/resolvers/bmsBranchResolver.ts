import { IContext } from '../../connectionResolver';
import { sendCoreMessage } from '../../messageBroker';

const item = {
  async user1s(touritem: any, {}, { models, subdomain }: IContext) {
    const users = await sendCoreMessage({
      subdomain,
      action: 'users.find',
      data: {
        query: {
          _id: { $in: touritem?.user1Ids || [] }
        }
      },
      isRPC: true
    });
    return users;
  },
  async user2s(touritem: any, {}, { models, subdomain }: IContext) {
    const users = await sendCoreMessage({
      subdomain,
      action: 'users.find',
      data: {
        query: {
          _id: { $in: touritem?.user2Ids || [] }
        }
      },
      isRPC: true
    });
    return users;
  }
};

export default item;
