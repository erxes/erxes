import customScalars from '@erxes/api-utils/src/customScalars';

import mutations from './mutations';
import queries from './queries';
import { Types } from '../../models';

const Mobinet = {
  currentType(mobinet, _args) {
    return Types.findOne({ _id: mobinet.typeId });
  }
};

const resolvers: any = async _serviceDiscovery => ({
  ...customScalars,
  Mobinet,
  Mutation: {
    ...mutations
  },
  Query: {
    ...queries
  }
});

export default resolvers;
