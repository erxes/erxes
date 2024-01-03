import customScalars from '@erxes/api-utils/src/customScalars';

import mutations from './mutations';
import queries, { dacUserActiveCupons } from './queries';
// import { Types } from '../../models';

const Dac = {
  currentType(dac, _args) {
    return null;
  }
};

const resolvers: any = async _serviceDiscovery => ({
  ...customScalars,
  Dac,
  Mutation: {
    ...mutations
  },
  Query: {
    ...queries,
    dacUserActiveCupons
  }
});

export default resolvers;
