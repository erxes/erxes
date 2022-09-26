import { sendCoreMessage } from '../../messageBroker';

const resolvers = {
  user: (pos, {}, { subdomain }) => {
    if (!pos.userId) {
      return null;
    }

    return sendCoreMessage({
      subdomain,
      action: 'users.findOne',
      data: { _id: pos.userId },
      isRPC: true
    });
  }
};

export default resolvers;
