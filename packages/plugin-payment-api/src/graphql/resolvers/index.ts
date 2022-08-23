import customScalars from '@erxes/api-utils/src/customScalars';

import PaymentTypeCount from './paymentConfigCount';
import mutations from './mutations';
import queries from './queries';

const resolvers: any = async serviceDiscovery => ({
  ...customScalars,
  PaymentTypeCount,
  Mutation: {
    ...mutations
  },
  Query: {
    ...queries
  }
});

export default resolvers;
