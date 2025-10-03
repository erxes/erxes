import { sendTRPCMessage } from 'erxes-api-shared/utils';

const resolvers = {
  category: async (posProduct) => {
    return await sendTRPCMessage({
      method: 'query',
      pluginName: 'core',
      module: 'productCategories',
      action: 'findOne',
      input: {
        _id: posProduct.categoryId
      }
    });
  }
};

export default resolvers;
