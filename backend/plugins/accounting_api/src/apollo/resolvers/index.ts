import { apolloCustomScalars } from 'erxes-api-shared/utils';
import Account from '@/accounting/graphql/resolvers/customResolvers/account';
import AccountPermission from '@/accounting/graphql/resolvers/customResolvers/accountPermission';
import AccountCategory from '@/accounting/graphql/resolvers/customResolvers/accountCategory';
import AccTransaction from '@/accounting/graphql/resolvers/customResolvers/accTransaction';
import AccTrRecord from '@/accounting/graphql/resolvers/customResolvers/accTrRecord';
import AccTrDetail from '@/accounting/graphql/resolvers/customResolvers/accTrDetail';
import AdjustInvDetail from '@/accounting/graphql/resolvers/customResolvers/adjustInvDetail';
import { AdjustFxaDetail } from '@/accounting/graphql/resolvers/customResolvers/adjustFxaDetail';
import {
  AccountingConfigs as MutationsAccountingConfig,
  AccountingCheckSynced as MutationsAccountingCheckSynced,
  AccountCategories as MutationsAccountCategory,
  Accounts as MutationsAccount,
  VatRows as MutationsVatRow,
  CtaxRows as MutationsCtaxRow,
  Transactions as MutationsTransactions,
  AdjustFixedAssets as MutationsAdjustFixedAssets,
  AdjustInventories as MutationsAdjustInventories,
  AccountPermissions as MutationsAccountPermissions,
} from '@/accounting/graphql/resolvers/mutations';
import {
  AccountingConfigs as QueriesAccountingConfig,
  AccountCategories as QueriesAccountCategory,
  Accounts as QueriesAccount,
  VatRows as QueriesVatRows,
  CtaxRows as QueriesCtaxRows,
  Transactions as QueriesTransactions,
  Inventories as QueriesInventories,
  AdjustFixedAssets as QueriesAdjustFixedAssets,
  AdjustInventories as QueriesAdjustInventories,
  JournalReport as QueriesJournalReport,
  AccountPermissions as QueriesAccountPermissions,
} from '@/accounting/graphql/resolvers/queries';
import ReserveRem from '@/inventories/graphql/resolvers/customResolvers/reserveRem';
import SafeRemainderItem from '@/inventories/graphql/resolvers/customResolvers/safeRemainderItem';
import SafeRemainder from '@/inventories/graphql/resolvers/customResolvers/safeRemainder';
import {
  ReserveRems as QueriesReserveRem,
  SafeRemainderItems as QueriesSafeRemainderItem,
  SafeRemainders as QueriesSafeRemainder,
} from '@/inventories/graphql/resolvers/queries';
import {
  Remainders as MutationsRemainder,
  ReserveRems as MutationsReserveRem,
  SafeRemainderItems as MutationsSafeRemainderItem,
  SafeRemainders as MutationsSafeRemainder,
} from '@/inventories/graphql/resolvers/mutations';
import MutationsFixedAssets from '~/modules/fixedAssets/graphql/resolvers/mutations/fixedAssets';
import QueriesFixedAssets from '~/modules/fixedAssets/graphql/resolvers/queries/fixedAssets';

const resolvers: any = {
  ...apolloCustomScalars,
  Account,
  AccountPermission,
  AccountCategory,
  AccCommonTransaction: AccTransaction,
  AccCommonTrRecord: AccTrRecord,
  AccTrDetail,
  AdjustInvDetail,
  AdjustFxaDetail,

  ReserveRem,
  SafeRemainderItem,
  SafeRemainder,

  Mutation: {
    ...MutationsAccountCategory,
    ...MutationsAccount,
    ...MutationsAccountingConfig,
    ...MutationsAccountingCheckSynced,
    ...MutationsVatRow,
    ...MutationsCtaxRow,
    ...MutationsTransactions,
    ...MutationsAdjustInventories,
    ...MutationsAdjustFixedAssets,
    ...MutationsAccountPermissions,
    ...MutationsRemainder,
    ...MutationsReserveRem,
    ...MutationsSafeRemainderItem,
    ...MutationsSafeRemainder,
    ...MutationsFixedAssets,
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
    ...QueriesAdjustFixedAssets,
    ...QueriesJournalReport,
    ...QueriesAccountPermissions,
    ...QueriesReserveRem,
    ...QueriesSafeRemainderItem,
    ...QueriesSafeRemainder,
    ...QueriesFixedAssets,
  },
};

export default resolvers;
