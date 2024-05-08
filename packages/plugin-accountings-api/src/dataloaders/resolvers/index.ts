import customScalars from '@erxes/api-utils/src/customScalars';
import Account from './account';
import AccountCategory from './accountCategory';
import {
  AccountingsConfigs as MutationsAccountingsConfig,
  AccountCategories as MutationsAccountCategory,
  Accounts as MutationsAccount,
  VatRows as MutationsVatRow,
  CtaxRows as MutationsCtaxRow,
  
} from './mutations';
import {
  AccountingsConfigs as QueriesAccountingsConfig,
  AccountCategories as QueriesAccountCategory,
  Accounts as QueriesAccount,
  VatRows as QueriesVatRows,
  CtaxRows as QueriesCtaxRows,
} from './queries';

const resolvers: any = {
  ...customScalars,
  Account,
  AccountCategory,
  Mutation: {
    ...MutationsAccountCategory,
    ...MutationsAccount,
    ...MutationsAccountingsConfig,
    ...MutationsVatRow,
    ...MutationsCtaxRow,
  },
  Query: {
    ...QueriesAccount,
    ...QueriesAccountCategory,
    ...QueriesAccountingsConfig,
    ...QueriesVatRows,
    ...QueriesCtaxRows
  },
};

export default resolvers;
