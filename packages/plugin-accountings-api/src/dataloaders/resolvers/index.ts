import customScalars from '@erxes/api-utils/src/customScalars';
import Account from './account';
import AccountCategory from './accountCategory';
import {
  AccountingsConfigs as MutationsAccountingsConfig,
  AccountCategories as MutationsAccountCategory,
  Accounts as MutationsAccount,
} from './mutations';
import {
  AccountingsConfigs as QueriesAccountingsConfig,
  AccountCategories as QueriesAccountCategory,
  Accounts as QueriesAccount,
} from './queries';

const resolvers: any = {
  ...customScalars,
  Account,
  AccountCategory,
  Mutation: {
    ...MutationsAccountCategory,
    ...MutationsAccount,
    ...MutationsAccountingsConfig,
  },
  Query: {
    ...QueriesAccount,
    ...QueriesAccountCategory,
    ...QueriesAccountingsConfig,
  },
};

export default resolvers;
