import customScalars from '@erxes/api-utils/src/customScalars';

import Invoice from './invoice';
import PaymentConfig from './paymentConfig'; 
import mutations from './mutations';
import queries from './queries';
import PaymentTransaction from './transaction';

const resolvers: any = async () => ({
  ...customScalars,

  Invoice,
  PaymentConfig,
  PaymentTransaction,
  Mutation: {
    ...mutations,
  },
  Query: {
    ...queries,
  },
});

export default resolvers;
