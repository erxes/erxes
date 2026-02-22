import customScalars from 'erxes-api-shared/src';
import mutations from './mutations';
import queries from './queries';
import { GolomtBankAccount } from './accounts';

const resolvers: any = async () => ({
  ...customScalars,
  GolomtBankAccount,

  Mutation: {
    ...mutations,
  },
  Query: {
    ...queries,
  },
});

export default resolvers;
