import { AUTOMATION_HISTORIES_CURSOR_SESSION_KEY } from '@/automations/constants';
import { AUTOMATION_HISTORIES } from '@/automations/graphql/automationQueries';
import { StatusBadgeValue } from '@/automations/types';
import { useQuery } from '@apollo/client';
import {
  EnumCursorDirection,
  mergeCursorData,
  parseDateRangeFromString,
  useMultiQueryState,
  useRecordTableCursor,
  validateFetchMore,
} from 'erxes-ui';
import { useEffect, useRef } from 'react';
import { useParams } from 'react-router';

const LOGS_PER_PAGE = 20;

/**
 * @param automationId addresses an automation that is not the one in the URL —
 * a campaign's own flow, shown beside the campaign rather than on the builder
 * page. Falls back to the route's automation.
 */
export const useAutomationHistories = (automationId?: string) => {
  const { id: routeId } = useParams();
  const id = automationId ?? routeId;
  const [queries] = useMultiQueryState<{
    status?: StatusBadgeValue;
    createdAt: string;
    failedActionId?: string;
    errorCode?: string;
    waitingActionId?: string;
  }>(['status', 'createdAt', 'failedActionId', 'errorCode', 'waitingActionId']);
  const { cursor, setCursor } = useRecordTableCursor({
    sessionKey: AUTOMATION_HISTORIES_CURSOR_SESSION_KEY,
  });

  const filterKey = [
    id,
    queries.status,
    queries.createdAt,
    queries.failedActionId,
    queries.errorCode,
    queries.waitingActionId,
  ].join('|');
  const previousFilterKey = useRef(filterKey);

  useEffect(() => {
    if (previousFilterKey.current === filterKey) {
      return;
    }

    previousFilterKey.current = filterKey;
    sessionStorage.removeItem(AUTOMATION_HISTORIES_CURSOR_SESSION_KEY);
    sessionStorage.removeItem(
      `${AUTOMATION_HISTORIES_CURSOR_SESSION_KEY}_scroll`,
    );
    setCursor('');
  }, [filterKey, setCursor]);

  const { data, loading, error, fetchMore, refetch } = useQuery(
    AUTOMATION_HISTORIES,
    {
      variables: {
        automationId: id,
        cursor: cursor ?? undefined,
        limit: LOGS_PER_PAGE,
        beginDate: parseDateRangeFromString(queries.createdAt)?.from,
        endDate: parseDateRangeFromString(queries.createdAt)?.to,
        status: queries.status,
        failedActionIds: queries.failedActionId
          ? [queries.failedActionId]
          : undefined,
        errorCodes: queries.errorCode ? [queries.errorCode] : undefined,
        waitingActionIds: queries.waitingActionId
          ? [queries.waitingActionId]
          : undefined,
      },
    },
  );

  const { automationHistories } = data || {};

  const { list = [], totalCount = 0, pageInfo } = automationHistories || {};

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
        limit: 20,
        direction,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        return Object.assign({}, prev, {
          automationHistories: mergeCursorData({
            direction,
            fetchMoreResult: fetchMoreResult.automationHistories,
            prevResult: prev.automationHistories,
          }),
        });
      },
    });
  };

  return {
    list,
    totalCount,
    loading,
    error,
    hasPreviousPage,
    hasNextPage,
    handleFetchMore,
    refetch,
  };
};
