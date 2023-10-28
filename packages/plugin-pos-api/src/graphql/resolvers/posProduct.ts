import { sendProductsMessage } from '../../messageBroker';

const resolvers = {
  category: async (posProduct, {}, { subdomain }) => {
    return sendProductsMessage({
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
