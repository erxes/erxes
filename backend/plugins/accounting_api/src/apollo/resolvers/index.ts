import { apolloCustomScalars } from 'erxes-api-shared/utils';
import Account from '@/accounting/graphql/resolvers/customResolvers/account';
import AccountCategory from '@/accounting/graphql/resolvers/customResolvers/accountCategory';
import AccTransaction from '@/accounting/graphql/resolvers/customResolvers/accTransaction';
import AccTrDetail from '@/accounting/graphql/resolvers/customResolvers/accTrDetail';
import AdjustInvDetail from '@/accounting/graphql/resolvers/customResolvers/adjustInvDetail';
import {
  AccountingConfigs as MutationsAccountingConfig,
  AccountCategories as MutationsAccountCategory,
  Accounts as MutationsAccount,
  VatRows as MutationsVatRow,
  CtaxRows as MutationsCtaxRow,
  Transactions as MutationsTransactions,
  AdjustInventories as MutationsAdjustInventories
} from '@/accounting/graphql/resolvers/mutations';
import {
  AccountingConfigs as QueriesAccountingConfig,
  AccountCategories as QueriesAccountCategory,
  Accounts as QueriesAccount,
  VatRows as QueriesVatRows,
  CtaxRows as QueriesCtaxRows,
  Transactions as QueriesTransactions,
  Inventories as QueriesInventories,
  AdjustInventories as QueriesAdjustInventories,
} from '@/accounting/graphql/resolvers/queries';

const resolvers: any = {
  ...apolloCustomScalars,
  Account,
  AccountCategory,
  AccCommonTransaction: AccTransaction,
  AccTrDetail,
  AdjustInvDetail,
  Mutation: {
    ...MutationsAccountCategory,
    ...MutationsAccount,
    ...MutationsAccountingConfig,
    ...MutationsVatRow,
    ...MutationsCtaxRow,
    ...MutationsTransactions,
    ...MutationsAdjustInventories,
  },
  Query: {
    ...QueriesAccount,
    ...QueriesAccountCategory,
    ...QueriesAccountingConfig,
    ...QueriesVatRows,
    ...QueriesCtaxRows,
    ...QueriesTransactions,
    ...QueriesInventories,
    ...QueriesAdjustInventories,
  },
};

export default resolvers;
