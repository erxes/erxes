import customScalars from '@erxes/api-utils/src/customScalars';
import DocumentMutations from './documentMutations';
import DocumentQueries from './documentQueries';

const resolvers: any = {
  ...customScalars,
  Mutation: {
    ...DocumentMutations
  },
  Query: {
    ...DocumentQueries
  }
};

export default resolvers;
