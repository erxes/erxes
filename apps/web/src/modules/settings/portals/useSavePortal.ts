import { messageOf, orpc } from '@erxes/core-contract/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

/** Saves the portal's changes and reads it and the list again. */
export const useSavePortal = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'portals' });
  const { toast } = useToast();
  const client = useQueryClient();

  return useMutation(
    orpc.portals.update.mutationOptions({
      onSuccess: () => {
        void client.invalidateQueries({ queryKey: orpc.portals.key() });
        toast({ title: t('saved', 'Saved') });
      },
      onError: (failure) =>
        toast({
          variant: 'destructive',
          title: t('failed', 'Not saved'),
          description: messageOf(failure),
        }),
    }),
  );
};
