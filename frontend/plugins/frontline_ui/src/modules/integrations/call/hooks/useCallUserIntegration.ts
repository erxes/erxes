import { CALL_USER_INTEGRATIONS } from '@/integrations/call/graphql/queries/callConfigQueries';
import { ICallConfig } from '@/integrations/call/types/callTypes';
import { useQuery } from '@apollo/client';
import { toast } from 'erxes-ui';

export const useCallUserIntegration = () => {
  const { data, loading } = useQuery<{
    callUserIntegrations: ICallConfig[];
  }>(CALL_USER_INTEGRATIONS, {
    onError: (e) => {
      toast({
        title: 'Uh oh! Something went wrong while getting user integrations',
        description: e.message,
        variant: 'destructive',
      });
    },
  });

  const { callUserIntegrations } = data || {};

  return { callUserIntegrations, loading };
};
