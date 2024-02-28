import customScalars from '@erxes/api-utils/src/customScalars';
import Account from './account';
import AccountCategory from './accountCategory';
import {
  AccountingsConfigs as MutationsAccountingsConfig,
  Accounts as Mutations,
} from './mutations';
import {
  AccountingsConfigs as QueriesAccountingsConfig,
  Accounts as Queries,
} from './queries';

const resolvers: any = {
  ...customScalars,
  Account,
  AccountCategory,
  Mutation: {
    ...Mutations,
    ...MutationsAccountingsConfig,
  },
  Query: {
    ...Queries,
    ...QueriesAccountingsConfig,
  },
};

export default resolvers;
