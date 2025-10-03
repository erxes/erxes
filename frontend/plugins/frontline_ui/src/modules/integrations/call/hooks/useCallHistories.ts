import { useQuery } from '@apollo/client';
import { CALL_HISTORIES } from '../graphql/queries/callHistories';
import { useAtomValue } from 'jotai';
import { callConfigAtom } from '@/integrations/call/states/sipStates';

export const useCallHistories = (missed?: boolean) => {
  const config = useAtomValue(callConfigAtom);

  const { data, loading, fetchMore } = useQuery<{
    callHistories: {
      _id: string;
      callStartTime: string;
      callStatus: string;
      callType: string;
      customerPhone: string;
      extensionNumber: string;
      conversationId: string;
    }[];
    callHistoriesTotalCount: number;
  }>(CALL_HISTORIES, {
    variables: {
      integrationId: config?.inboxId,
      ...(missed ? { callStatus: 'cancelled' } : {}),
    },
  });

  const { callHistories, callHistoriesTotalCount } = data || {};

  const handleFetchMore = () =>
    fetchMore({
      variables: {
        skip: data?.callHistories.length || 0,
      },
    });

  return { callHistories, callHistoriesTotalCount, loading, handleFetchMore };
};
