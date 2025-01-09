import customScalars from '@erxes/api-utils/src/customScalars';
import Account from './account';
import AccountCategory from './accountCategory';
import AccTransaction from './accTransaction';
import AccTrDetail from './accTrDetail';
import {
  AccountingConfigs as MutationsAccountingConfig,
  AccountCategories as MutationsAccountCategory,
  Accounts as MutationsAccount,
  VatRows as MutationsVatRow,
  CtaxRows as MutationsCtaxRow,
  TransactionMain as MutationTrMain,
  TransactionCash as MutationTrCash,
  Transactions as MutationsTransactions
} from './mutations';
import {
  AccountingConfigs as QueriesAccountingConfig,
  AccountCategories as QueriesAccountCategory,
  Accounts as QueriesAccount,
  VatRows as QueriesVatRows,
  CtaxRows as QueriesCtaxRows,
  Transactions as QueriesTransactions,
} from './queries';

const resolvers: any = {
  ...customScalars,
  Account,
  AccountCategory,
  AccCommonTransaction: AccTransaction,
  AccTrDetail,
  Mutation: {
    ...MutationsAccountCategory,
    ...MutationsAccount,
    ...MutationsAccountingConfig,
    ...MutationsVatRow,
    ...MutationsCtaxRow,
    ...MutationsTransactions,
    ...MutationTrMain,
    ...MutationTrCash,
  },
  Query: {
    ...QueriesAccount,
    ...QueriesAccountCategory,
    ...QueriesAccountingConfig,
    ...QueriesVatRows,
    ...QueriesCtaxRows,
    ...QueriesTransactions,
  },
};

export default resolvers;
