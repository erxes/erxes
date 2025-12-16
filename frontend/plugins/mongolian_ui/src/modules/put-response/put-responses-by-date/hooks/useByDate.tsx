import { QueryHookOptions, useQuery } from '@apollo/client';
import {
  EnumCursorDirection,
  IRecordTableCursorPageInfo,
  isUndefinedOrNull,
  parseDateRangeFromString,
  useMultiQueryState,
  useRecordTableCursor,
  validateFetchMore,
} from 'erxes-ui';
import { useEffect, useMemo } from 'react';

import { byDateQueries } from '~/modules/put-response/put-responses-by-date/graphql/queries/ByDateQueries';
import { IPutResponse } from '@/put-response/types/PutResponseType';
import { BY_DATE_CURSOR_SESSION_KEY } from '@/put-response/put-responses-by-date/constants/ByDateCursorSessionKey';
import { useSetAtom } from 'jotai';
import { byDateTotalCountAtom } from '@/put-response/put-responses-by-date/states/ByDateCounts';

export const BY_DATE_PER_PAGE = 30;

interface IByDateResponse {
  putResponsesByDate: IPutResponse[];
}

export const useByDateVariables = (
  variables?: QueryHookOptions<IByDateResponse>['variables'],
) => {
  const [
    {
      billId,
      contentType,
      dealName,
      boardId,
      pipelineId,
      stageId,
      orderNumber,
      contractNumber,
      transactionNumber,
      status,
      billType,
      billIdRule,
      isLast,
      dateRange,
    },
  ] = useMultiQueryState<{
    billId: string;
    contentType: string;
    dealName: string;
    boardId: string;
    pipelineId: string;
    stageId: string;
    orderNumber: string;
    contractNumber: string;
    transactionNumber: string;
    status: string;
    billType: string;
    billIdRule: string;
    isLast: string;
    dateRange: string;
  }>([
    'billId',
    'contentType',
    'dealName',
    'boardId',
    'pipelineId',
    'stageId',
    'orderNumber',
    'contractNumber',
    'transactionNumber',
    'status',
    'billType',
    'billIdRule',
    'isLast',
    'dateRange',
  ]);

  const { cursor } = useRecordTableCursor({
    sessionKey: BY_DATE_CURSOR_SESSION_KEY,
  });

  const result = {
    limit: BY_DATE_PER_PAGE,
    cursor,
    createdStartDate: parseDateRangeFromString(dateRange)?.from,
    createdEndDate: parseDateRangeFromString(dateRange)?.to,
    search: Array.isArray(billId) ? billId[0] : billId,
    contentType: contentType && contentType !== 'all' ? contentType : undefined,
    boardId: boardId || undefined,
    pipelineId: pipelineId || undefined,
    stageId: stageId || undefined,
    dealName: dealName || undefined,
    orderNumber: orderNumber || undefined,
    contractNumber: contractNumber || undefined,
    transactionNumber: transactionNumber || undefined,
    success: status && status !== 'all' ? status : undefined,
    billType: billType || undefined,
    billIdRule: billIdRule || undefined,
    isLast: isLast || undefined,
    ...variables,
  };

  return result;
};

export const useByDate = (options?: QueryHookOptions) => {
  const setPutResponseByDateTotalCount = useSetAtom(byDateTotalCountAtom);
  const variables = useByDateVariables(options?.variables);
  const { data, loading, fetchMore } = useQuery<IByDateResponse>(
    byDateQueries.putResponsesByDate,
    {
      ...options,
      skip: options?.skip || isUndefinedOrNull(variables.cursor),
      variables: {
        ...variables,
      },
    },
  );

  const { byDate, pageInfo } = useMemo(() => {
    const responseData = data?.putResponsesByDate;

    return {
      byDate: responseData || [],
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false,
        startCursor: null,
        endCursor: null,
      } as IRecordTableCursorPageInfo,
    };
  }, [data]);

  const totalCount = useMemo(() => {
    return data?.putResponsesByDate?.length || 0;
  }, [data]);
  useEffect(() => {
    setPutResponseByDateTotalCount(totalCount ?? 0);
  }, [totalCount, setPutResponseByDateTotalCount]);
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
        limit: BY_DATE_PER_PAGE,
        direction,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;

        const prevData = Array.isArray(prev.putResponsesByDate)
          ? prev.putResponsesByDate
          : [];
        const newData = Array.isArray(fetchMoreResult.putResponsesByDate)
          ? fetchMoreResult.putResponsesByDate
          : [];

        return {
          ...prev,
          putResponsesByDate:
            direction === EnumCursorDirection.FORWARD
              ? [...prevData, ...newData]
              : [...newData, ...prevData],
        };
      },
    });
  };

  return {
    loading,
    byDate,
    totalCount,
    handleFetchMore,
    pageInfo,
  };
};
