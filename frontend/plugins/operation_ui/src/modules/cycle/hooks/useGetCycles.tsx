
import { CYCLES_CURSOR_SESSION_KEY } from '@/cycle/constants';
import { GET_CYCLES } from '@/cycle/graphql/queries/getCycles';
import { useQuery, QueryHookOptions } from '@apollo/client';
import {
  EnumCursorDirection,
  ICursorListResponse,
  isUndefinedOrNull,
  useToast,
  validateFetchMore,
  mergeCursorData,
} from 'erxes-ui';
import { ICycle } from '@/cycle/types';
import { useRecordTableCursor } from 'erxes-ui';
import { useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { useSetAtom } from 'jotai';
import { cycleTotalCountAtom } from '@/cycle/states/cycleTotalCountState';
const CYCLES_PER_PAGE = 30;

export const useCyclesVariables = (
  variables?: QueryHookOptions<ICursorListResponse<ICycle>>['variables'],
) => {
  const { teamId } = useParams();
  const { cursor } = useRecordTableCursor({
    sessionKey: CYCLES_CURSOR_SESSION_KEY,
  });

  return {
    limit: CYCLES_PER_PAGE,
    orderBy: {
      createdAt: -1,
    },
    cursor,
    teamId: teamId || undefined,
    ...variables,
  };
};

export const useGetCycles = (
  options?: QueryHookOptions<ICursorListResponse<ICycle>>,
) => {
  const variables = useCyclesVariables(options?.variables);
  const { toast } = useToast();
  const { data, loading, error, fetchMore } = useQuery<
    ICursorListResponse<ICycle>
  >(GET_CYCLES, {
    ...options,
    variables,
    skip: options?.skip || isUndefinedOrNull(variables.cursor),
    onError: (e) => {
      toast({
        title: 'Error',
        description: e.message,
        variant: 'destructive',
      });
    },
  });
  const { list: cycles, pageInfo, totalCount } = data?.getCycles || {};
  const setCycleTotalCount = useSetAtom(cycleTotalCountAtom);
  useEffect(() => {
    if (isUndefinedOrNull(totalCount)) return;
    setCycleTotalCount(totalCount);
  }, [totalCount, setCycleTotalCount]);

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
        limit: CYCLES_PER_PAGE,
        direction,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;

        return Object.assign({}, prev, {
          getCycles: mergeCursorData({
            direction,
            fetchMoreResult: fetchMoreResult.getCycles,
            prevResult: prev.getCycles,
          }),
        });
      },
    });
  };
  return {
    data,
    loading,
    error,
    handleFetchMore,
    cycles,
    pageInfo,
    totalCount,
  };
};
