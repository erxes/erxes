import { messageOf, orpc } from '@erxes/core-contract/client';
import { type QueryKey, useQueryClient } from '@tanstack/react-query';
import { useToast } from 'erxes-ui';

export const useIntegrationsSaved = (
  failedTitle: string,
  onSaved: (() => void) | undefined,
  queryKey: QueryKey,
) => {
  const { toast } = useToast();
  const client = useQueryClient();

  return {
    onSuccess: () => {
      onSaved?.();

      return Promise.all([
        client.invalidateQueries({ queryKey }),
        client.invalidateQueries({ queryKey: orpc.integrations.list.key() }),
      ]);
    },
    onError: (error: Error) =>
      toast({ variant: 'destructive', title: failedTitle, description: messageOf(error) }),
  };
};
