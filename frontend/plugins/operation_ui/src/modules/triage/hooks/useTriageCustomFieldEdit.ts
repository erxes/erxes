import { useUpdateTriage } from '@/triage/hooks/useUpdateTriage';
import { useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import type { IMutateCallbacks } from 'ui-modules';

export const useTriageCustomFieldEdit = () => {
  const { updateTriage, loading } = useUpdateTriage();
  const { toast } = useToast();
  const { t } = useTranslation('operation');

  return {
    mutate: (
      { _id, propertiesData }: { _id: string } & Record<string, unknown>,
      callbacks?: IMutateCallbacks,
    ) =>
      updateTriage({
        variables: {
          _id,
          input: { propertiesData },
        },
        onCompleted: () => {
          callbacks?.onCompleted?.();
          toast({
            title: t('triage-properties-updated', {
              defaultValue: 'Triage properties updated',
            }),
            variant: 'success',
          });
        },
        onError: () => callbacks?.onError?.(),
      }),
    loading,
  };
};
