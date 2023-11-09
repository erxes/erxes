import customScalars from '@erxes/api-utils/src/customScalars';
// import mutations from './mutations';
import queries from './queries';

const resolvers: any = {
  ...customScalars,
  Mutation: {},
  Query: {
    ...queries
  }
};

export default resolvers;
