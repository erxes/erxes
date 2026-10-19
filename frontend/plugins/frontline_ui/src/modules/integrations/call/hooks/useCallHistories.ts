import { useQuery } from '@apollo/client';
import { isDefined } from 'erxes-ui';
import { CALL_HISTORIES } from '../graphql/queries/callHistories';
import { useAtomValue } from 'jotai';
import { callConfigAtom } from '@/integrations/call/states/sipStates';
import type { CallHistoriesQuery } from '~/gql/graphql';

export const CALL_HISTORIES_PER_PAGE = 20;

export type ICallHistoryItem = NonNullable<
  NonNullable<CallHistoriesQuery['callHistories']>[number]
>;

export const useCallHistories = ({
  missed,
  callType,
  searchValue,
}: {
  missed?: boolean;
  callType?: string;
  searchValue?: string;
} = {}) => {
  const config = useAtomValue(callConfigAtom);

  const { data, loading, fetchMore } = useQuery(CALL_HISTORIES, {
    variables: {
      integrationId: config?.inboxId,
      limit: CALL_HISTORIES_PER_PAGE,
      ...(missed ? { callStatus: 'cancelled' } : {}),
      ...(callType ? { callType } : {}),
      ...(searchValue ? { searchValue } : {}),
    },
    skip: !config?.inboxId,
  });

  const callHistories = data?.callHistories?.filter(isDefined);
  const callHistoriesTotalCount = data?.callHistoriesTotalCount;

  const handleFetchMore = () =>
    fetchMore({
      variables: {
        skip: data?.callHistories?.length || 0,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult?.callHistories?.length) return prev;
        return {
          ...prev,
          callHistories: [
            ...(prev.callHistories || []),
            ...fetchMoreResult.callHistories,
          ],
          callHistoriesTotalCount:
            fetchMoreResult.callHistoriesTotalCount ??
            prev.callHistoriesTotalCount,
        };
      },
    });

  return { callHistories, callHistoriesTotalCount, loading, handleFetchMore };
};
