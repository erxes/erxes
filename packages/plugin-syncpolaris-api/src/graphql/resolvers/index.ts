import customScalars from '@erxes/api-utils/src/customScalars';

import mutations from './mutations';
import queries from './queries';
import { Types } from '../../models';

const Syncpolaris = {
  currentType(syncpolaris, _args) {
    return Types.findOne({ _id: syncpolaris.typeId });
  }
};

const resolvers: any = async _serviceDiscovery => ({
  ...customScalars,
  Syncpolaris,
  Mutation: {
    ...mutations
  },
  Query: {
    ...queries
  }
});

export default resolvers;
