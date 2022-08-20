import { sendEbarimtMessage } from '../../messageBroker';

const resolvers = {
  putResponses: async (order, {}, { subdomain }) => {
    return sendEbarimtMessage({
      subdomain,
      action: 'putresponses.find',
      data: {
        query: {
          contentType: 'pos',
          contentId: order._id
        }
      },
      isRPC: true
    });
  }
};

export default resolvers;
