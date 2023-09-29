import customScalars from '@erxes/api-utils/src/customScalars';

import mutations from './mutations';
import queries from './queries';
// import { Types } from '../../models';

const Xyp = {
  currentType(xyp, _args) {
    // return Types.findOne({ _id: xyp.typeId });
  }
};

const resolvers: any = async _serviceDiscovery => ({
  ...customScalars,
  Xyp,
  Mutation: {
    ...mutations
  },
  Query: {
    ...queries
  }
});

export default resolvers;
