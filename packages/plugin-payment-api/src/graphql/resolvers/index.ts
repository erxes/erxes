import customScalars from '@erxes/api-utils/src/customScalars';

import Invoice from './invoice';
import PaymentConfig from './paymentConfig';
import mutations from './mutations';
import queries from './queries';

const resolvers: any = async () => ({
  ...customScalars,

  Invoice,
  PaymentConfig,
  Mutation: {
    ...mutations
  },
  Query: {
    ...queries
  }
});

export default resolvers;
