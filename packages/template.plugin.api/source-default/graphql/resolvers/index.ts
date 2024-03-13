import customScalars from '@erxes/api-utils/src/customScalars';

import mutations from './mutations';
import queries from './queries';
import { Types } from '../../models';

const {Name} = {
  currentType({name}, _args) {
    return Types.findOne({ _id: {name}.typeId });
  }
};

const resolvers: any = async () => ({
  ...customScalars,
  {Name},
  Mutation: {
    ...mutations
  },
  Query: {
    ...queries
  }
});

export default resolvers;
