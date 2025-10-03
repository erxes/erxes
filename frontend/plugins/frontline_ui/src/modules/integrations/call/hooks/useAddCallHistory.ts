import { useMutation } from '@apollo/client';
import { CALL_HISTORY_ADD } from '../graphql/mutations/callMutations';
import { useAtomValue, useSetAtom } from 'jotai';
import {
  currentCallConversationIdAtom,
  historyIdAtom,
} from '@/integrations/call/states/callStates';
import { callConfigAtom } from '@/integrations/call/states/sipStates';

export const useAddCallHistory = () => {
  const [addHistoryMutation, { loading }] = useMutation(CALL_HISTORY_ADD);

  const setHistoryId = useSetAtom(historyIdAtom);
  const config = useAtomValue(callConfigAtom);
  const setCurrentCallConversationId = useSetAtom(
    currentCallConversationIdAtom,
  );

  const addHistory = (
    callStatus: string,
    timeStamp: number,
    direction: string,
    customerPhone: string,
    callStartTime: Date,
    queueName?: string | null,
  ) => {
    addHistoryMutation({
      variables: {
        timeStamp: parseInt(timeStamp.toString()),
        callType: direction,
        callStatus,
        customerPhone,
        inboxIntegrationId: config?.inboxId,
        callStartTime,
        queueName,
      },
      onCompleted: ({ callHistoryAdd }) => {
        const callHistoryId = callHistoryAdd?._id;
        const callConversationId = callHistoryAdd?.conversationId;
        setHistoryId(callHistoryId);
        setCurrentCallConversationId(callConversationId);
      },
      onError: (e) => {
        setHistoryId(null);
        setCurrentCallConversationId(null);

        if (e.message !== 'You cannot edit') {
          // toast({
          //   title: 'Uh oh! Something went wrong.',
          //   description: e.message,
          //   variant: 'destructive',
          // });
        }
      },
    });
  };

  return {
    addHistory,
    loading,
  };
};
