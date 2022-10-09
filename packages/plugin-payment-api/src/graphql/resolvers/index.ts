import customScalars from '@erxes/api-utils/src/customScalars';

import Invoice from './invoice';
import mutations from './mutations';
import PaymentTypeCount from './paymentConfigCount';
import { paymentQueries, queries } from './queries';

const resolvers: any = async () => ({
  ...customScalars,
  PaymentTypeCount,
  Invoice,
  Mutation: {
    ...mutations
  },
  Query: {
    ...queries,
    ...paymentQueries
  }
});

export default resolvers;
