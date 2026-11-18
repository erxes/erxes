import { messageOf, orpc } from '@erxes/core-contract/client';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

/**
 * A structure mutation's handlers: on success the units and unit types load again everywhere,
 * then `done` runs; a failure shows a toast unless `onError` handles it.
 */
export const useStructureHandlers = <T>(done?: (result: T) => void) => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const { toast } = useToast();
  const client = useQueryClient();

  return {
    onSuccess: (result: T) => {
      void client.invalidateQueries({ queryKey: orpc.units.key() });
      void client.invalidateQueries({ queryKey: orpc.unitTypes.key() });
      done?.(result);
    },
    onError: (error: unknown) =>
      toast({
        variant: 'destructive',
        title: t('save-failed', 'Could not save it'),
        description: messageOf(error),
      }),
  };
};
