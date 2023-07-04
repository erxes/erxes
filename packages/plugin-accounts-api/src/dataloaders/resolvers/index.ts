import customScalars from '@erxes/api-utils/src/customScalars';
import Account from './account';
import AccountCategory from './accountCategory';
import { Accounts as Mutations } from './mutations';
import { Accounts as Queries } from './queries';

const resolvers: any = {
  ...customScalars,
  Account,
  AccountCategory,

  Mutation: {
    ...Mutations
  },
  Query: {
    ...Queries
  }
};

export default resolvers;
