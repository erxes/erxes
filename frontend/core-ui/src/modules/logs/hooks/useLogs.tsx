import { gql, useQuery } from '@apollo/client';
import {
  EnumCursorDirection,
  mergeCursorData,
  parseDateRangeFromString,
  useRecordTableCursor,
  validateFetchMore,
} from 'erxes-ui';
import { useSearchParams } from 'react-router';
import {
  LOGS_COMMON_FILTER_FIELD_NAMES,
  LOGS_CURSOR_SESSION_KEY,
} from '../constants/logFilter';
import { LOGS_MAIN_LIST } from '../graphql/logQueries';
import { LogsMainListQueryResponse } from '../types';

const LOGS_PER_PAGE = 20;
const getParamsObject = (searchParams: URLSearchParams) => {
  const entries = Array.from(searchParams.entries());
  const result = Object.fromEntries(entries);
  return result;
};

const generateFilters = (searchParams: URLSearchParams) => {
  const queryParams = getParamsObject(searchParams);

  const filters: any = {};

  if (queryParams.status) {
    filters.status = {
      value: queryParams.status,
      operator: queryParams.statusOperator,
    };
  }

  if (queryParams.source) {
    filters.source = {
      value: queryParams.source,
      operator: queryParams.sourceOperator || undefined,
    };
  }

  if (queryParams.action) {
    filters.action = {
      value: queryParams.action,
      operator: queryParams.actionOperator || undefined,
    };
  }

  if (queryParams.userIds && queryParams.userIds.length > 0) {
    filters.userIds = {
      value: queryParams.userIds,
      operator: queryParams.userIdsOperator || undefined,
    };
  }

  if (queryParams.createdAt) {
    filters.createdAt = {
      value: parseDateRangeFromString(queryParams.createdAt)?.from,
      operator: queryParams.createdAtOperator || undefined,
    };
  }

  const queryParamsKeys = Object.keys(queryParams);
  const customFilters = queryParamsKeys.filter(
    (key) => !LOGS_COMMON_FILTER_FIELD_NAMES.includes(key),
  );

  if (customFilters.length) {
    for (const customFilter of customFilters) {
      if (!customFilter?.includes(`Operator`)) {
        const value = (queryParams as any)[customFilter];
        const operator = (queryParams as any)[`${customFilter}Operator`];
        filters[`payload.${customFilter}`] = {
          value,
          operator,
        };
      }
    }
  }

  return filters;
};

export const useLogs = () => {
  const [searchParams] = useSearchParams();
  const { cursor } = useRecordTableCursor({
    sessionKey: LOGS_CURSOR_SESSION_KEY,
  });

  const { data, loading, error, fetchMore } =
    useQuery<LogsMainListQueryResponse>(LOGS_MAIN_LIST, {
      variables: {
        filters: generateFilters(searchParams),
        cursor: cursor ?? undefined,
        limit: LOGS_PER_PAGE,
      },
    });

  const { list = [], totalCount = 0, pageInfo } = data?.logsMainList || {};
  const { hasPreviousPage, hasNextPage } = pageInfo || {};

  const handleFetchMore = ({
    direction,
  }: {
    direction: EnumCursorDirection;
  }) => {
    if (!validateFetchMore({ direction, pageInfo })) {
      return;
    }

    fetchMore({
      variables: {
        cursor:
          direction === EnumCursorDirection.FORWARD
            ? pageInfo?.endCursor
            : pageInfo?.startCursor,
        limit: LOGS_PER_PAGE,
        direction,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        return Object.assign({}, prev, {
          logsMainList: mergeCursorData({
            direction,
            fetchMoreResult: fetchMoreResult.logsMainList,
            prevResult: prev.logsMainList,
          }),
        });
      },
    });
  };

  return {
    loading,
    list,
    totalCount,
    error,
    handleFetchMore,
    hasNextPage,
    hasPreviousPage,
  };
};
