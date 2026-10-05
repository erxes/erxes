import { CYCLES_CURSOR_SESSION_KEY } from '@/cycle/constants';
import { GET_CYCLES } from '@/cycle/graphql/queries/getCycles';
import { cycleTotalCountAtom } from '@/cycle/states/cycleTotalCountState';
import {
  compactList,
  mergeCursorList,
  toCursorPageInfo,
} from '@/operation/utils/cursorList';
import { QueryHookOptions, useQuery } from '@apollo/client';
import {
  EnumCursorDirection,
  isUndefinedOrNull,
  useRecordTableCursor,
  useToast,
  validateFetchMore,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useSetAtom } from 'jotai';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  GetCyclesRecordTableQuery,
  GetCyclesRecordTableQueryVariables,
} from '~/gql/graphql';
const CYCLES_PER_PAGE = 30;

export const useCyclesVariables = (
  variables?: GetCyclesRecordTableQueryVariables,
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
    teamId,
    ...variables,
  };
};

export const useGetCycles = (
  options?: QueryHookOptions<
    GetCyclesRecordTableQuery,
    GetCyclesRecordTableQueryVariables
  >,
) => {
  const variables = useCyclesVariables(options?.variables);
  const { t } = useTranslation('operation');
  const { toast } = useToast();
  const { data, loading, error, fetchMore } = useQuery(GET_CYCLES, {
    ...options,
    variables,
    skip: options?.skip || isUndefinedOrNull(variables.cursor),
    onError: (e) => {
      toast({
        title: t('error'),
        description: e.message,
        variant: 'destructive',
      });
    },
  });
  const { list, pageInfo, totalCount } = data?.getCycles || {};
  const cycles = compactList(list);
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
    if (
      !validateFetchMore({ direction, pageInfo: toCursorPageInfo(pageInfo) })
    ) {
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
        if (!prev.getCycles || !fetchMoreResult?.getCycles) return prev;

        return Object.assign({}, prev, {
          getCycles: mergeCursorList(
            direction,
            prev.getCycles,
            fetchMoreResult.getCycles,
          ),
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
    pageInfo: toCursorPageInfo(pageInfo),
    totalCount,
  };
};
