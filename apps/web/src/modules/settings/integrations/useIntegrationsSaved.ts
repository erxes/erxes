import { messageOf } from '@erxes/core-contract/client';
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

      return client.invalidateQueries({ queryKey });
    },
    onError: (error: Error) =>
      toast({ variant: 'destructive', title: failedTitle, description: messageOf(error) }),
  };
};
