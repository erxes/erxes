import customScalars from '@erxes/api-utils/src/customScalars';
import mutations from './mutations';

const resolvers: any = {
  ...customScalars,
  Mutation: {
    ...mutations
  }
};

export default resolvers;
