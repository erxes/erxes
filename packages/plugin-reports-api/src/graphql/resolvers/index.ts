import customScalars from '@erxes/api-utils/src/customScalars';

import mutations from './mutations';
import queries from './queries';
import { Types } from '../../models';

const Reports = {
  currentType(reports, _args) {
    return Types.findOne({ _id: reports.typeId });
  }
};

const resolvers: any = async _serviceDiscovery => ({
  ...customScalars,
  Reports,
  Mutation: {
    ...mutations
  },
  Query: {
    ...queries
  }
});

export default resolvers;
