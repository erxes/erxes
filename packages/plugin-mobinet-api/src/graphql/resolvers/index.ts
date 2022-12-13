import customScalars from '@erxes/api-utils/src/customScalars';

import mutations from './mutations';
import queries from './queries';
import { District } from './districts';
import { Quarter } from './quarters';
import { Building } from './buildings';

const resolvers: any = async _serviceDiscovery => ({
  ...customScalars,

  District,
  Quarter,
  Building,

  Mutation: {
    ...mutations
  },
  Query: {
    ...queries
  }
});

export default resolvers;
