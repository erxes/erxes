import customScalars from '@erxes/api-utils/src/customScalars';
import Account from './account';
import AccountCategory from './accountCategory';
import {
  AccountingsConfigs as MutationsAccountingsConfig,
  AccountCategories as MutationsAccountCategory,
  Accounts as MutationsAccount,
  VATRows as MutationsVatRow,
} from './mutations';
import {
  AccountingsConfigs as QueriesAccountingsConfig,
  AccountCategories as QueriesAccountCategory,
  Accounts as QueriesAccount,
  VATRows as QueriesVATRows
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
  },
  Query: {
    ...QueriesAccount,
    ...QueriesAccountCategory,
    ...QueriesAccountingsConfig,
    ...QueriesVATRows,
  },
};

export default resolvers;
