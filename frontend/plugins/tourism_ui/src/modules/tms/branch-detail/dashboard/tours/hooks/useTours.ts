import { QueryHookOptions, useQuery } from '@apollo/client';
import {
  EnumCursorDirection,
  IRecordTableCursorPageInfo,
  isUndefinedOrNull,
  mergeCursorData,
  useMultiQueryState,
  useRecordTableCursor,
  validateFetchMore,
} from 'erxes-ui';
import { GET_TOURS } from '../graphql/queries';
import { TOURS_CURSOR_SESSION_KEY } from '../constants/tourCursorSessionKey';
import { ITour } from '../types/tour';

const TOURS_PER_PAGE = 30;

type ToursQueryVariables = {
  branchId?: string;
  status?: string;
  date_status?:
    | 'running'
    | 'completed'
    | 'scheduled'
    | 'cancelled'
    | 'unscheduled';
  limit?: number;
  cursor?: string;
  direction?: EnumCursorDirection;
  orderBy?: Record<string, number>;
};

export const useTours = (
  options?: QueryHookOptions<
    {
      bmsTours: {
        list: ITour[];
        totalCount: number;
        pageInfo: IRecordTableCursorPageInfo;
      };
    },
    ToursQueryVariables
  >,
) => {
  const [{ status, date_status }] = useMultiQueryState<{
    status: string;
    date_status:
      | 'running'
      | 'completed'
      | 'scheduled'
      | 'cancelled'
      | 'unscheduled';
  }>(['status', 'date_status']);

  const { cursor } = useRecordTableCursor({
    sessionKey: TOURS_CURSOR_SESSION_KEY,
  });

  const variables: ToursQueryVariables = {
    orderBy: { createdAt: -1 },
    ...(options?.variables || {}),
    status: status || undefined,
    date_status: date_status || undefined,
    cursor,
    limit: TOURS_PER_PAGE,
  };

  const { data, loading, fetchMore } = useQuery(GET_TOURS, {
    ...options,
    skip: options?.skip || isUndefinedOrNull(variables.cursor),
    variables,
  });

  const { list: tours, totalCount, pageInfo } = data?.bmsTours || {};

  const handleFetchMore = ({
    direction,
  }: {
    direction: EnumCursorDirection;
  }) => {
    if (!validateFetchMore({ direction, pageInfo })) return;

    fetchMore({
      variables: {
        cursor:
          direction === EnumCursorDirection.FORWARD
            ? pageInfo?.endCursor
            : pageInfo?.startCursor,
        limit: TOURS_PER_PAGE,
        direction,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;

        return Object.assign({}, prev, {
          bmsTours: mergeCursorData({
            direction,
            fetchMoreResult: fetchMoreResult.bmsTours,
            prevResult: prev.bmsTours,
          }),
        });
      },
    });
  };

  return {
    loading,
    tours,
    totalCount,
    pageInfo,
    handleFetchMore,
  };
};
