import { useMutation } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { BROADCAST_UPDATE_CONFIGS } from '../graphql/mutations';

/** Saves one broadcast setting as it is changed; there is no save button. */
export const useBroadcastConfig = () => {
  const { t } = useTranslation('broadcasts');
  const { toast } = useToast();

  const [update, { loading: isLoading }] = useMutation(
    BROADCAST_UPDATE_CONFIGS,
    {
      refetchQueries: ['Configs', 'EmailSenderOptions'],
      awaitRefetchQueries: true,
      onCompleted: () =>
        toast({ variant: 'success', title: t('toast.settings-saved') }),
      onError: (error) =>
        toast({
          variant: 'destructive',
          title: t('toast.error'),
          description: error.message,
        }),
    },
  );

  const updateConfig = (configsMap: Record<string, string>) =>
    update({ variables: { configsMap } });

  return { updateConfig, isLoading };
};
