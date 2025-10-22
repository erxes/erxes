import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';

const resolvers = {
  category: async (posProduct, _, { subdomain }: IContext) => {
    return await sendTRPCMessage({
      subdomain,

      method: 'query',
      pluginName: 'core',
      module: 'productCategories',
      action: 'findOne',
      input: {
        _id: posProduct.categoryId,
      },
    });
  },
};

export default resolvers;
