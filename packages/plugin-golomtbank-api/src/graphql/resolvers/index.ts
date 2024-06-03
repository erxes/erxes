import customScalars from '@erxes/api-utils/src/customScalars';

import mutations from './mutations';
import queries from './queries';
//import { GolomtBankAccount } from './queries/accounts';

const resolvers: any = async () => ({
  ...customScalars,
  // GolomtBankStatement,

  Mutation: {
    ...mutations
  },
  Query: {
    ...queries
  }
});

export default resolvers;
