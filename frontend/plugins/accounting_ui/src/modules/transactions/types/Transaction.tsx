import type { GraphqlView } from '@/utils/graphql';
import type { AccountingAccTrRecordsQuery } from '~/gql/graphql';
import {
  toTransactionView,
  TransactionDetailView,
} from '../utils/transactionView';

export type ITransaction = Omit<
  Partial<ReturnType<typeof toTransactionView>>,
  'details'
> & { details: ITrDetail[] };
export type ITrDetail = Partial<TransactionDetailView>;
export type ITrRecord = GraphqlView<
  NonNullable<
    NonNullable<
      NonNullable<AccountingAccTrRecordsQuery['accTrRecordsMain']>['list']
    >[number]
  >
>;

export const trsQueryParamTypes: { [key: string]: string } = {
  ids: 'string[]',
  excludeIds: 'boolean',
  status: 'string',
  searchValue: 'string',
  number: 'string',
  accountIds: 'string[]',
  accountKind: 'string',
  accountExcludeIds: 'boolean',
  accountStatus: 'string',
  accountCategoryId: 'string',
  accountSearchValue: 'string',
  accountBrand: 'string',
  accountIsOutBalance: 'boolean',
  accountBranchId: 'string',
  accountDepartmentId: 'string',
  accountCurrency: 'string',
  accountJournal: 'string',
  brandId: 'string',
  isOutBalance: 'boolean',
  branchId: 'string',
  departmentId: 'string',
  currency: 'string',
  journal: 'string',
  statuses: 'string[]',
  createdUserId: 'string',
  modifiedUserId: 'string',
  date: 'startDate,endDate',
  updatedDate: 'startDate,endDate',
  createdDate: 'startDate,endDate',
  startDate: 'Date',
  endDate: 'Date',
  startUpdatedDate: 'Date',
  endUpdatedDate: 'Date',
  startCreatedDate: 'Date',
  endCreatedDate: 'Date',
};
