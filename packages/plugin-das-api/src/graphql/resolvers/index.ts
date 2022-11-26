import customScalars from '@erxes/api-utils/src/customScalars';

import mutations from './mutations';
import queries from './queries';
// import { Types } from '../../models';

const Das = {
  currentType(das, _args) {
    return null;
  }
};

const resolvers: any = async _serviceDiscovery => ({
  ...customScalars,
  Das,
  Mutation: {
    ...mutations
  },
  Query: {
    ...queries
  }
});

export default resolvers;
