import { QueryHookOptions, useQuery } from '@apollo/client';
import {
  EnumCursorDirection,
  IRecordTableCursorPageInfo,
  parseDateRangeFromString,
  useRecordTableCursor,
  validateFetchMore,
  useMultiQueryState,
} from 'erxes-ui';
import { useEffect, useMemo } from 'react';
import { useSetAtom } from 'jotai';

import { duplicatedQueries } from '@/put-response/put-responses-duplicated/graphql/DuplicatedQueries';
import { IDuplicated } from '@/put-response/put-responses-duplicated/types/DuplicatedType';
import { useDuplicatedLeadSessionKey } from './useDuplicatedLeadSessionKey';
import { duplicatedTotalCountAtom } from '../states/DuplicatedCounts';

export const DUPLICATED_PER_PAGE = 30;

export const useDuplicatedVariables = (
  variables?: QueryHookOptions<{
    putResponsesDuplicated: {
      list: IDuplicated[];
      totalCount: number;
      pageInfo: IRecordTableCursorPageInfo;
    };
  }>['variables'],
) => {
  const [{ billType, dateRange }] = useMultiQueryState<{
    billType: string;
    dateRange: string;
  }>(['billType', 'dateRange']);
  const { sessionKey } = useDuplicatedLeadSessionKey();

  const { cursor } = useRecordTableCursor({
    sessionKey,
  });

  const parsedDateRange = parseDateRangeFromString(dateRange);

  return {
    limit: DUPLICATED_PER_PAGE,
    orderBy: {
      createdAt: -1,
    },
    cursor,
    startDate: parsedDateRange?.from,
    endDate: parsedDateRange?.to,
    createdStartDate: parsedDateRange?.from,
    createdEndDate: parsedDateRange?.to,
    type: 'duplicated',
    billType: billType || undefined,
    ...variables,
  };
};

interface IDuplicatedResponse {
  putResponsesDuplicated: {
    list: IDuplicated[];
    totalCount: number;
    pageInfo: IRecordTableCursorPageInfo;
  };
}

export const useDuplicated = (options?: QueryHookOptions) => {
  const setPutResponseDuplicatedTotalCount = useSetAtom(
    duplicatedTotalCountAtom,
  );
  const variables = useDuplicatedVariables(options?.variables);

  const { data, loading, fetchMore, error } = useQuery<IDuplicatedResponse>(
    duplicatedQueries.putResponsesDuplicated,
    {
      ...options,
      variables,
    },
  );

  const { putResponsesDuplicated, pageInfo, totalCount } = useMemo(() => {
    const responseData = data?.putResponsesDuplicated;

    if (!responseData) {
      return {
        putResponsesDuplicated: [],
        pageInfo: {
          hasNextPage: false,
          hasPreviousPage: false,
          startCursor: null,
          endCursor: null,
        } as IRecordTableCursorPageInfo,
        totalCount: 0,
      };
    }

    return {
      putResponsesDuplicated: Array.isArray(responseData.list)
        ? responseData.list
        : [],
      pageInfo:
        responseData.pageInfo ||
        ({
          hasNextPage: false,
          hasPreviousPage: false,
          startCursor: null,
          endCursor: null,
        } as IRecordTableCursorPageInfo),
      totalCount: responseData.totalCount || 0,
    };
  }, [data]);

  useEffect(() => {
    if (!totalCount) return;
    setPutResponseDuplicatedTotalCount(totalCount);
  }, [totalCount, setPutResponseDuplicatedTotalCount]);

  const handleFetchMore = ({
    direction,
  }: {
    direction: EnumCursorDirection;
  }) => {
    if (!pageInfo) return;

    if (!validateFetchMore({ direction, pageInfo })) {
      return;
    }

    fetchMore({
      variables: {
        ...variables,
        cursor:
          direction === EnumCursorDirection.FORWARD
            ? pageInfo?.endCursor
            : pageInfo?.startCursor,
        direction,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;

        const newItems = Array.isArray(
          fetchMoreResult.putResponsesDuplicated?.list,
        )
          ? fetchMoreResult.putResponsesDuplicated.list
          : [];

        const prevItems = Array.isArray(prev.putResponsesDuplicated?.list)
          ? prev.putResponsesDuplicated.list
          : [];

        return {
          ...prev,
          putResponsesDuplicated: {
            ...prev.putResponsesDuplicated,
            list:
              direction === EnumCursorDirection.FORWARD
                ? [...prevItems, ...newItems]
                : [...newItems, ...prevItems],
            totalCount:
              fetchMoreResult.putResponsesDuplicated?.totalCount ||
              prev.putResponsesDuplicated?.totalCount ||
              0,
            pageInfo:
              fetchMoreResult.putResponsesDuplicated?.pageInfo ||
              prev.putResponsesDuplicated?.pageInfo,
          },
        };
      },
    });
  };

  return {
    loading,
    error,
    putResponsesDuplicated,
    totalCount,
    handleFetchMore,
    pageInfo,
  };
};
