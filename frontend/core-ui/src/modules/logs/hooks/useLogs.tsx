import { useQuery } from '@apollo/client';
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
const parseSearchParamValue = (value: string | null) => {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value);
  } catch {
    if (value === 'true') {
      return true;
    }

    if (value === 'false') {
      return false;
    }

    return value;
  }
};

const getParamsObject = (searchParams: URLSearchParams) => {
  return Array.from(searchParams.entries()).reduce<Record<string, any>>(
    (acc, [key, value]) => {
      acc[key] = parseSearchParamValue(value);
      return acc;
    },
    {},
  );
};

const generatePayloadFilters = (searchParams: URLSearchParams) => {
  const queryParams = getParamsObject(searchParams);
  const filters: any = {};

  const queryParamsKeys = Object.keys(queryParams);
  const customFilters = queryParamsKeys.filter(
    (key) => !LOGS_COMMON_FILTER_FIELD_NAMES.includes(key),
  );

  if (customFilters.length) {
    for (const customFilter of customFilters) {
      if (!customFilter?.includes(`Operator`)) {
        const value = (queryParams as any)[customFilter];
        const operator = (queryParams as any)[`${customFilter}Operator`];

        if (value === null || value === undefined || value === '') {
          continue;
        }

        filters[customFilter] = {
          value,
          operator,
        };
      }
    }
  }

  return filters;
};

const generateVariables = (searchParams: URLSearchParams) => {
  const queryParams = getParamsObject(searchParams);
  const createdAtRange =
    typeof queryParams.createdAt === 'string'
      ? parseDateRangeFromString(queryParams.createdAt)
      : undefined;

  const userIds = Array.isArray(queryParams.userIds)
    ? queryParams.userIds
    : queryParams.userIds
      ? [queryParams.userIds]
      : undefined;

  return {
    status:
      typeof queryParams.status === 'string' ? queryParams.status : undefined,
    source:
      typeof queryParams.source === 'string' ? queryParams.source : undefined,
    action:
      typeof queryParams.action === 'string' ? queryParams.action : undefined,
    userIds,
    contentType:
      typeof queryParams.contentType === 'string'
        ? queryParams.contentType
        : undefined,
    documentId:
      typeof queryParams.docId === 'string'
        ? queryParams.docId.trim() || undefined
        : undefined,
    createdAtFrom: createdAtRange?.from,
    createdAtTo: createdAtRange?.to,
    filters: generatePayloadFilters(searchParams),
  };
};

export const useLogs = () => {
  const [searchParams] = useSearchParams();
  const { cursor } = useRecordTableCursor({
    sessionKey: LOGS_CURSOR_SESSION_KEY,
  });

  const { data, loading, error, fetchMore } =
    useQuery<LogsMainListQueryResponse>(LOGS_MAIN_LIST, {
      variables: {
        cursor: cursor ?? undefined,
        limit: LOGS_PER_PAGE,
        ...generateVariables(searchParams),
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
