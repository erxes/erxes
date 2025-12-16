import { QueryHookOptions, useQuery } from '@apollo/client';
import {
  EnumCursorDirection,
  IRecordTableCursorPageInfo,
  isUndefinedOrNull,
  mergeCursorData,
  parseDateRangeFromString,
  useMultiQueryState,
  useRecordTableCursor,
  validateFetchMore,
} from 'erxes-ui';
import { putResponseQueries } from '~/modules/put-response/graphql/queries/PutResopnseQueries';
import { IPutResponse } from '@/put-response/types/PutResponseType';
import { usePutResponseLeadSessionKey } from '@/put-response/hooks/usePutResponseLeadSessionKey';
import { useSetAtom } from 'jotai';
import { useEffect } from 'react';
import { putResponseTotalCountAtom } from '../states/usePutResponseCounts';
export const PUT_RESPONSE_PER_PAGE = 30;

export const usePutResponseVariables = (
  variables?: QueryHookOptions<{
    putResponses: {
      list: IPutResponse[];
      totalCount: number;
      pageInfo: IRecordTableCursorPageInfo;
    };
  }>['variables'],
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
  const { sessionKey } = usePutResponseLeadSessionKey();

  const { cursor } = useRecordTableCursor({
    sessionKey,
  });

  return {
    limit: PUT_RESPONSE_PER_PAGE,
    orderBy: {
      createdAt: -1,
    },
    cursor,
    createdStartDate: parseDateRangeFromString(dateRange)?.from,
    createdEndDate: parseDateRangeFromString(dateRange)?.to,
    type: 'putResponse',
    search: billId || undefined,
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
};

export const usePutResponse = (options?: QueryHookOptions) => {
  const setPutResponseTotalCount = useSetAtom(putResponseTotalCountAtom);
  const variables = usePutResponseVariables(options?.variables);
  const { data, loading, fetchMore } = useQuery<{
    putResponses: {
      list: IPutResponse[];
      totalCount: number;
      pageInfo: IRecordTableCursorPageInfo;
    };
  }>(putResponseQueries.putResponses, {
    ...options,
    skip: options?.skip || isUndefinedOrNull(variables.cursor),
    variables: {
      ...variables,
    },
  });

  const { list: putResponses, totalCount, pageInfo } = data?.putResponses || {};
  useEffect(() => {
    setPutResponseTotalCount(totalCount ?? 0);
  }, [totalCount, setPutResponseTotalCount]);

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
        limit: PUT_RESPONSE_PER_PAGE,
        direction,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        return {
          ...prev,
          putResponses: {
            ...mergeCursorData({
              direction,
              fetchMoreResult: fetchMoreResult.putResponses,
              prevResult: prev.putResponses,
            }),
            totalCount: fetchMoreResult.putResponses.totalCount,
          },
        };
      },
    });
  };

  return {
    loading,
    putResponses,
    totalCount,
    handleFetchMore,
    pageInfo,
  };
};
