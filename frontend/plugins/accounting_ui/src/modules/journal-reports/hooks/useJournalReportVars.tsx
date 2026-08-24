import { QueryHookOptions } from '@apollo/client';
import {
  ICursorListResponse,
  parseDateRangeFromString,
  useMultiQueryState,
} from 'erxes-ui';
import { trsQueryParamTypes } from '~/modules/transactions/types/Transaction';
import { IJournalReport } from '../types/journalReport';
import { ReportRules } from '../types/reportsMap';

type JournalReportVariables = NonNullable<
  QueryHookOptions<ICursorListResponse<IJournalReport>>['variables']
> & {
  report?: string;
  groupRule?: unknown;
};

const getConvertedValue = (key: string, value: string) => {
  if (
    key === 'trKinds' ||
    key === 'productIds' ||
    key === 'fixedAssetIds' ||
    key === 'customerIds'
  ) {
    return { [key]: value.split(',') };
  }

  const typeName = trsQueryParamTypes[key];

  if (typeName === 'boolean') {
    return { [key]: value === 'true' || value === 'True' };
  }

  if (typeName === 'Date') {
    return { [key]: new Date(value) };
  }

  if (typeName === 'string[]') {
    if (Array.isArray(value)) {
      return { [key]: value };
    }
    return { [key]: value.split(',') };
  }

  if (typeName === 'startDate,endDate') {
    const parsed = parseDateRangeFromString(value);
    const camel = key.charAt(0).toUpperCase() + key.slice(1);
    return {
      [`start${camel}`]: parsed?.from,
      [`end${camel}`]: parsed?.to,
    };
  }

  return { [key]: value + '' };
};

export const useTransactionsQueryParams = () => {
  const [queryParams] = useMultiQueryState<{
    status: string;
    searchValue: string;
    number: string;
    accountIds: string;
    accountKind: string;
    accountExcludeIds: string;
    accountStatus: string;
    accountCategoryId: string;
    accountSearchValue: string;
    accountBrand: string;
    accountIsOutBalance: string;
    accountBranchId: string;
    accountDepartmentId: string;
    accountCurrency: string;
    accountJournal: string;
    brandId: string;
    isOutBalance: string;
    productId: string;
    productIds: string;
    fixedAssetId: string;
    fixedAssetIds: string;
    customerId: string;
    customerIds: string;
    contentType: string;
    contentId: string;
    branchId: string;
    departmentId: string;
    currency: string;
    journal: string;
    statuses: string;
    trKind: string;
    trKinds: string;
    getTrKind: string;
    createdUserId: string;
    modifiedUserId: string;
    fromDate: string;
    toDate: string;
    report: string;
    groupKey: string;
    isMore: string;
  }>([
    'status',
    'searchValue',
    'number',
    'accountIds',
    'accountKind',
    'accountExcludeIds',
    'accountStatus',
    'accountCategoryId',
    'accountSearchValue',
    'accountBrand',
    'accountIsOutBalance',
    'accountBranchId',
    'accountDepartmentId',
    'accountCurrency',
    'accountJournal',
    'brandId',
    'isOutBalance',
    'productId',
    'productIds',
    'fixedAssetId',
    'fixedAssetIds',
    'customerId',
    'customerIds',
    'contentType',
    'contentId',
    'branchId',
    'departmentId',
    'currency',
    'journal',
    'statuses',
    'trKind',
    'trKinds',
    'getTrKind',
    'createdUserId',
    'modifiedUserId',
    'fromDate',
    'toDate',
    'report',
    'groupKey',
    'isMore',
  ]);

  return queryParams;
};

export const useJouranlReportVariables = (
  variables?: QueryHookOptions<
    ICursorListResponse<IJournalReport>
  >['variables'],
): JournalReportVariables => {
  const { report, groupKey, ...queryParams } = useTransactionsQueryParams();

  const curVariables = Object.entries(queryParams).reduce(
    (acc, [key, value]) => {
      if (!value) return acc;

      Object.assign(acc, getConvertedValue(key, value));
      return acc;
    },
    {} as Record<string, string | boolean | Date | string[]>,
  );

  const reportConfig = ReportRules[report || ''];
  const groups = reportConfig?.groups;
  const defaultGroupKey = reportConfig?.choices?.[0]?.code || 'default';
  const groupRule = groups?.[groupKey || defaultGroupKey];

  return {
    ...variables,
    ...curVariables,
    report: report || '',
    groupRule,
  };
};
