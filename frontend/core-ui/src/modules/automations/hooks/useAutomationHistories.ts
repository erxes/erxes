import { useAutomation } from '@/automations/context/AutomationProvider';
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
import { useParams } from 'react-router';

const LOGS_PER_PAGE = 20;

export const useAutomationHistories = () => {
  const { id } = useParams();
  const [queries] = useMultiQueryState<{
    status?: StatusBadgeValue;
    createdAt: string;
  }>(['status', 'createdAt']);
  const { cursor } = useRecordTableCursor({
    sessionKey: AUTOMATION_HISTORIES_CURSOR_SESSION_KEY,
  });

  const { actionsConst = [], triggersConst = [] } = useAutomation();
  const { data, loading, fetchMore, refetch } = useQuery(AUTOMATION_HISTORIES, {
    variables: {
      automationId: id,
      cursor: cursor ?? undefined,
      limit: LOGS_PER_PAGE,
      beginDate: parseDateRangeFromString(queries.createdAt)?.from,
      endDate: parseDateRangeFromString(queries.createdAt)?.to,
      status: queries.status,
    },
  });

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
    hasPreviousPage,
    hasNextPage,
    triggersConst,
    actionsConst,
    handleFetchMore,
    refetch,
  };
};
