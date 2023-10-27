import customScalars from '@erxes/api-utils/src/customScalars';

import mutations from './mutations';
import queries from './queries';
import { Types } from '../../models';

const Calls = {
  currentType(calls, _args) {
    return Types.findOne({ _id: calls.typeId });
  }
};

const resolvers: any = async _serviceDiscovery => ({
  ...customScalars,
  Calls,
  Mutation: {
    ...mutations
  },
  Query: {
    ...queries
  }
});

export default resolvers;
