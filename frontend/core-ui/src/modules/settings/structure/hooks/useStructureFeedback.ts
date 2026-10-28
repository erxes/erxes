import { toast } from 'erxes-ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export const useStructureFeedback = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });

  return useMemo(
    () => ({
      success: (title: string) => toast({ title, variant: 'success' }),
      failure: (error: unknown) =>
        toast({
          title: t('error'),
          description: error instanceof Error ? error.message : undefined,
          variant: 'destructive',
        }),
    }),
    [t],
  );
};
