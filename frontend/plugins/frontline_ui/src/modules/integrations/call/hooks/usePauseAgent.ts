import { useMutation, useQuery } from '@apollo/client';
import { CALL_GET_AGENT_STATUS } from '../graphql/queries/callConfigQueries';
import { CALL_PAUSE_AGENT } from '@/integrations/call/graphql/mutations/callMutations';
import { useAtomValue } from 'jotai';
import { callConfigAtom } from '@/integrations/call/states/sipStates';
import { toast } from 'erxes-ui';

export const usePauseAgent = () => {
  const { data, loading } = useQuery(CALL_GET_AGENT_STATUS);
  const callConfig = useAtomValue(callConfigAtom);
  const [changeAgentStatus, { loading: changeAgentStatusLoading }] =
    useMutation(CALL_PAUSE_AGENT, {
      refetchQueries: [CALL_GET_AGENT_STATUS],
      onError(error) {
        toast({
          title: 'Uh oh! Something went wrong while pausing agent',
          description: error.message,
          variant: 'destructive',
        });
      },
    });

  const pauseAgent = (status: string) => {
    changeAgentStatus({
      variables: {
        status,
        integrationId: callConfig?.inboxId,
      },
    });
  };

  return {
    agentStatus: data?.callGetAgentStatus,
    loading: loading || changeAgentStatusLoading,
    pauseAgent,
  };
};
