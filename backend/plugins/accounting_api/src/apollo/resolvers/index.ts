import { apolloCustomScalars } from 'erxes-api-shared/utils';
import Account from '@/accounting/graphql/resolvers/customResolvers/account';
import AccountCategory from '@/accounting/graphql/resolvers/customResolvers/accountCategory';
import AccTransaction from '@/accounting/graphql/resolvers/customResolvers/accTransaction';
import AccTrRecord from '@/accounting/graphql/resolvers/customResolvers/accTrRecord';
import AccTrDetail from '@/accounting/graphql/resolvers/customResolvers/accTrDetail';
import AdjustInvDetail from '@/accounting/graphql/resolvers/customResolvers/adjustInvDetail';
import {
  AccountingConfigs as MutationsAccountingConfig,
  AccountCategories as MutationsAccountCategory,
  Accounts as MutationsAccount,
  VatRows as MutationsVatRow,
  CtaxRows as MutationsCtaxRow,
  Transactions as MutationsTransactions,
  AdjustInventories as MutationsAdjustInventories,
<<<<<<< HEAD
  AdjustClosingEntries as MutationsAdjustClosingEntry,
=======
>>>>>>> 469d50b68935f87b7540f5531eaa38fa23ee569b
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
  JournalReport as QueriesJournalReport,
  AdjustClosingEntry as QueriesAdjustClosingEntry,
} from '@/accounting/graphql/resolvers/queries';
import Remainder from '@/inventories/graphql/resolvers/customResolvers/remainder';
import ReserveRem from '@/inventories/graphql/resolvers/customResolvers/reserveRem';
import SafeRemainderItem from '@/inventories/graphql/resolvers/customResolvers/safeRemainderItem';
import SafeRemainder from '@/inventories/graphql/resolvers/customResolvers/safeRemainder';
import {
  Remainders as QueriesRemainder,
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

const resolvers: any = {
  ...apolloCustomScalars,
  Account,
  AccountCategory,
  AccCommonTransaction: AccTransaction,
  AccCommonTrRecord: AccTrRecord,
  AccTrDetail,
  AdjustInvDetail,

  Remainder,
  ReserveRem,
  SafeRemainderItem,
  SafeRemainder,

  Mutation: {
    ...MutationsAccountCategory,
    ...MutationsAccount,
    ...MutationsAccountingConfig,
    ...MutationsVatRow,
    ...MutationsCtaxRow,
    ...MutationsTransactions,
    ...MutationsAdjustInventories,
<<<<<<< HEAD
    ...MutationsAdjustClosingEntry,
=======

    ...MutationsRemainder,
    ...MutationsReserveRem,
    ...MutationsSafeRemainderItem,
    ...MutationsSafeRemainder,
>>>>>>> 469d50b68935f87b7540f5531eaa38fa23ee569b
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
    ...QueriesJournalReport,
<<<<<<< HEAD
    ...QueriesAdjustClosingEntry,
=======

    ...QueriesRemainder,
    ...QueriesReserveRem,
    ...QueriesSafeRemainderItem,
    ...QueriesSafeRemainder,
>>>>>>> 469d50b68935f87b7540f5531eaa38fa23ee569b
  },
};

export default resolvers;
