import customScalars from '@erxes/api-utils/src/customScalars';

import mutations from './mutations';
import queries from './queries';
import { Types } from '../../models';

const Activity = {
  currentType(activity, _args) {
    return Types.findOne({ _id: activity.typeId });
  }
};

const resolvers: any = async () => ({
  ...customScalars,
  Activity,
  Mutation: {
    ...mutations
  },
  Query: {
    ...queries
  }
});

export default resolvers;
