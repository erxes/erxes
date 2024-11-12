import { sendCoreMessage } from '../../messageBroker';

const resolvers = {
  category: async (posProduct, {}, { subdomain }) => {
    return sendCoreMessage({
      subdomain,
      action: 'categories.findOne',
      data: {
        _id: posProduct.categoryId
      },
      isRPC: true
    });
  }
};

export default resolvers;
