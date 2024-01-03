import customScalars from '@erxes/api-utils/src/customScalars';

import mutations from './mutations';
import queries from './queries';
import AdWislist from './adWishlist';

const Ad = {};

const resolvers: any = async _serviceDiscovery => ({
  ...customScalars,
  Ad,
  AdWislist,

  Mutation: {
    ...mutations
  },
  Query: {
    ...queries
  }
});

export default resolvers;
