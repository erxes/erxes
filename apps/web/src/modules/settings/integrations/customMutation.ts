import { messageOf, orpc } from '@erxes/core-contract/client';
import { type QueryKey, useQueryClient } from '@tanstack/react-query';
import { useToast } from 'erxes-ui';

export const useIntegrationsSaved = (
  failedTitle: string,
  onSaved?: () => void,
  queryKey: QueryKey = orpc.integrations.key(),
) => {
  const { toast } = useToast();
  const client = useQueryClient();

  return {
    onSuccess: () => {
      onSaved?.();
      void client.invalidateQueries({ queryKey });
    },
    onError: (error: Error) =>
      toast({ variant: 'destructive', title: failedTitle, description: messageOf(error) }),
  };
};
