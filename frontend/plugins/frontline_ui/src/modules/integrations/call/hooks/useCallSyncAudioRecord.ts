import { gql, useMutation } from '@apollo/client';
import { CALL_SYNC_RECORD_FILE } from '@/integrations/call/graphql/mutations/callMutations';
import { toast } from 'erxes-ui';
import { CALL_HISTORY_DETAIL } from '@/integrations/call/graphql/queries/callHistoryDetailQuery';

export const useCallSyncAudioRecord = (conversationId: string | null) => {
  const [callSyncRecordFile, { loading }] = useMutation(
    gql(CALL_SYNC_RECORD_FILE),
    {
      refetchQueries: conversationId
        ? [
            {
              query: CALL_HISTORY_DETAIL,
              variables: { conversationId },
            },
          ]
        : [],
    },
  );

  return {
    callSyncRecordFile,
    loading,
  };
};
