import customScalars from '@erxes/api-utils/src/customScalars';

import mutations from './mutations';
import queries from './queries';
import { Types } from '../../models';

const Pms = {
  currentType(pms, _args) {
    return Types.findOne({ _id: pms.typeId });
  }
};

const resolvers: any = async () => ({
  ...customScalars,
  Pms,
  Mutation: {
    ...mutations
  },
  Query: {
    ...queries
  }
});

export default resolvers;
