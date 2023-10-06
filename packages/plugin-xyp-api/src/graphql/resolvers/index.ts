import customScalars from '@erxes/api-utils/src/customScalars';

import mutations from './mutations';
import queries from './queries';
import { IContext } from '../../connectionResolver';

const XypData = {
  async __resolveReference({ _id }, { models }: IContext) {
    console.log('resolverference', _id);
    const customer = await models.XypData.findOne({ _id });
    return customer;
  }
};

const resolvers: any = async _serviceDiscovery => ({
  ...customScalars,
  XypData,
  Mutation: {
    ...mutations
  },
  Query: {
    ...queries
  }
});

export default resolvers;
