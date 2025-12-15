import { QueryHookOptions } from '@apollo/client';
import {
  ICursorListResponse,
  parseDateRangeFromString,
  useMultiQueryState,
} from 'erxes-ui';
import { trsQueryParamTypes } from '~/modules/transactions/types/Transaction';
import { IJournalReport } from '../types/journalReport';
import { GroupRules } from '../types/reportsMap';

const getConvertedValue = (key: string, value: string) => {
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
    }
  }

  return { [key]: value + '' };
}

export const useTransactionsQueryParams = () => {
  const [queryParams] =
    useMultiQueryState<{
      status: string,
      searchValue: string,
      number: string,
      accountIds: string,
      accountKind: string,
      accountExcludeIds: string,
      accountStatus: string,
      accountCategoryId: string,
      accountSearchValue: string,
      accountBrand: string,
      accountIsOutBalance: string,
      accountBranchId: string,
      accountDepartmentId: string,
      accountCurrency: string,
      accountJournal: string,
      brandId: string,
      isOutBalance: string,
      branchId: string,
      departmentId: string,
      currency: string,
      journal: string,
      statuses: string,
      createdUserId: string,
      modifiedUserId: string,
      fromDate: string,
      toDate: string,
      report: string,
      groupKey: string,
    }>([
      'status', 'searchValue', 'number',
      'accountIds', 'accountKind', 'accountExcludeIds', 'accountStatus',
      'accountCategoryId', 'accountSearchValue', 'accountBrand', 'accountIsOutBalance',
      'accountBranchId', 'accountDepartmentId', 'accountCurrency', 'accountJournal',
      'brandId', 'isOutBalance', 'branchId', 'departmentId', 'currency', 'journal',
      'statuses', 'createdUserId', 'modifiedUserId',
      'fromDate', 'toDate', 'report', 'groupKey'
    ]);

  return queryParams
};

export const useJouranlReportVariables = (
  variables?: QueryHookOptions<ICursorListResponse<IJournalReport>>['variables'],
) => {
  const { report, groupKey, ...queryParams } = useTransactionsQueryParams();

  const curVariables = Object.entries(queryParams).reduce((acc, [key, value]) => {
    if (!value) return acc;

    Object.assign(acc, getConvertedValue(key, value));
    return acc;
  }, {} as Record<string, string | boolean | Date | string[]>);

  const groupRule = GroupRules[report || '']?.groups[groupKey || 'default'] || {};

  return {
    ...variables,
    ...curVariables,
    report,
    groupRule
  };
};
