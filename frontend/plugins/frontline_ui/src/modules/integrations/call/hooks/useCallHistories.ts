import { useQuery } from '@apollo/client';
import { CALL_HISTORIES } from '../graphql/queries/callHistories';
import { useAtomValue } from 'jotai';
import { callConfigAtom } from '@/integrations/call/states/sipStates';

export const CALL_HISTORIES_PER_PAGE = 20;

export interface ICallHistoryItem {
  _id: string;
  callStartTime: string;
  callStatus: string;
  callType: string;
  customerPhone: string;
  extensionNumber: string;
  conversationId: string;
}

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

  const { data, loading, fetchMore } = useQuery<{
    callHistories: ICallHistoryItem[];
    callHistoriesTotalCount: number;
  }>(CALL_HISTORIES, {
    variables: {
      integrationId: config?.inboxId,
      limit: CALL_HISTORIES_PER_PAGE,
      ...(missed ? { callStatus: 'cancelled' } : {}),
      ...(callType ? { callType } : {}),
      ...(searchValue ? { searchValue } : {}),
    },
    skip: !config?.inboxId,
  });

  const { callHistories, callHistoriesTotalCount } = data || {};

  const handleFetchMore = () =>
    fetchMore({
      variables: {
        skip: data?.callHistories.length || 0,
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
