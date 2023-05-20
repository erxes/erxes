import customScalars from '@erxes/api-utils/src/customScalars';
import DocumentMutations from './documentMutations';
import DocumentQueries from './documentQueries';
import Document from './document';

const resolvers: any = {
  ...customScalars,
  Document,
  Mutation: {
    ...DocumentMutations
  },
  Query: {
    ...DocumentQueries
  }
};

export default resolvers;
