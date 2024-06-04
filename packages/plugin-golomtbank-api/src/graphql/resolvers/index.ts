import customScalars from '@erxes/api-utils/src/customScalars';

import mutations from './mutations';
import queries from './queries';
import { GolomtBankAccount } from './accounts';

const resolvers: any = async () => ({
  ...customScalars,
  GolomtBankAccount,

  Mutation: {
    ...mutations
  },
  Query: {
    ...queries
  }
});

export default resolvers;
