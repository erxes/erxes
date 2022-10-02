import customScalars from '@erxes/api-utils/src/customScalars';

import PaymentTypeCount from './paymentConfigCount';
// import Invoice from './invoice';
import mutations from './mutations';
import queries from './queries';

const resolvers: any = async () => ({
  ...customScalars,
  PaymentTypeCount,
  // Invoice,
  Mutation: {
    ...mutations
  },
  Query: {
    ...queries
  }
});

export default resolvers;
