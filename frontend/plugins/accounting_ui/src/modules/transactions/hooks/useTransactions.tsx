import { OperationVariables, QueryHookOptions, useQuery } from '@apollo/client';
import {
  EnumCursorDirection,
  ICursorListResponse,
  IRecordTableCursorPageInfo,
  mergeCursorData,
  parseDateRangeFromString,
  useMultiQueryState,
  useRecordTableCursor,
  validateFetchMore
} from 'erxes-ui';
import { ACCTRANSACTIONS_CURSOR_SESSION_KEY } from '~/modules/accountsSessionKeys';
import { TRANSACTIONS_QUERY } from '../graphql/transactionQueries';
import { ACC_TRS__PER_PAGE } from '../types/constants';
import { ITransaction, trsQueryParamTypes } from '../types/Transaction';

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
      ids: string,
      excludeIds: string,
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
      date: string,
      updatedDate: string,
      createdDate: string,
    }>([
      'ids', 'excludeIds', 'status', 'searchValue', 'number',
      'accountIds', 'accountKind', 'accountExcludeIds', 'accountStatus',
      'accountCategoryId', 'accountSearchValue', 'accountBrand', 'accountIsOutBalance',
      'accountBranchId', 'accountDepartmentId', 'accountCurrency', 'accountJournal',
      'brandId', 'isOutBalance', 'branchId', 'departmentId', 'currency', 'journal',
      'statuses', 'createdUserId', 'modifiedUserId',
      'date', 'updatedDate', 'createdDate'
    ]);

  return queryParams
};

export const useTransactionsVariables = (
  variables?: QueryHookOptions<ICursorListResponse<ITransaction>>['variables'],
) => {
  const queryParams = useTransactionsQueryParams();

  const { cursor } = useRecordTableCursor({
    sessionKey: ACCTRANSACTIONS_CURSOR_SESSION_KEY,
  });

  const curVariables = Object.entries(queryParams).reduce((acc, [key, value]) => {
    if (!value) return acc;

    Object.assign(acc, getConvertedValue(key, value));
    return acc;
  }, {} as Record<string, string | boolean | Date | string[]>);

  return {
    limit: ACC_TRS__PER_PAGE,
    orderBy: {
      date: 1
    },
    cursor: cursor || '',
    ...variables,
    ...curVariables
  };
};

export const useTransactions = (options?: OperationVariables) => {
  const variables = useTransactionsVariables(options?.variables);

  const { data, loading, error, fetchMore } = useQuery<{
    accTransactionsMain: {
      list: ITransaction[];
      totalCount: number;
      pageInfo: IRecordTableCursorPageInfo;
    };
  }>(TRANSACTIONS_QUERY, {
    ...options,
    variables: {
      ...options?.variables,
      ...variables
    },
  });

  const { list: transactions, totalCount, pageInfo } = data?.accTransactionsMain || {};

  const handleFetchMore = ({
    direction,
  }: {
    direction: EnumCursorDirection;
  }) => {
    if (
      !validateFetchMore({
        direction,
        pageInfo,
      })
    ) {
      return;
    }

    fetchMore({
      variables: {
        cursor:
          direction === EnumCursorDirection.FORWARD
            ? pageInfo?.endCursor
            : pageInfo?.startCursor,
        limit: ACC_TRS__PER_PAGE,
        direction,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        return Object.assign({}, prev, {
          accTransactionsMain: mergeCursorData({
            direction,
            fetchMoreResult: fetchMoreResult.accTransactionsMain,
            prevResult: prev.accTransactionsMain,
          }),
        });
      },
    });
  };

  return {
    loading,
    transactions,
    totalCount,
    error,
    handleFetchMore,
    pageInfo,
  };

};
