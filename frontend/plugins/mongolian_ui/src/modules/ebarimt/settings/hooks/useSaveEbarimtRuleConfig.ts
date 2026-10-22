import { useMutation } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import {
  CREATE_MN_CONFIG,
  GET_MN_CONFIGS,
  UPDATE_MN_CONFIG,
} from '@/shared/graphql/mnConfigs';

/** Creates or updates one per-POS / per-stage ebarimt mnConfig entry. */
export const useSaveEbarimtRuleConfig = (code: string) => {
  const { t } = useTranslation('mongolian');
  const { toast } = useToast();
  const mutationOptions = {
    refetchQueries: [{ query: GET_MN_CONFIGS, variables: { code } }],
    awaitRefetchQueries: true,
  };
  const [createConfig, { loading: createLoading }] = useMutation(
    CREATE_MN_CONFIG,
    mutationOptions,
  );
  const [updateConfig, { loading: updateLoading }] = useMutation(
    UPDATE_MN_CONFIG,
    mutationOptions,
  );

  const saveConfig = async (
    subId: string,
    value: Record<string, unknown>,
    operation: 'create' | 'update',
    configId?: string,
  ) => {
    try {
      let savedId: string | undefined;

      if (operation === 'create' || !configId) {
        const { data } = await createConfig({
          variables: { code, subId, value },
        });
        savedId = data?.mnConfigsCreate?._id;
      } else {
        const { data } = await updateConfig({
          variables: { id: configId, subId, value },
        });
        savedId = data?.mnConfigsUpdate?._id;
      }

      toast({
        title: t('success'),
        description: t('config-saved-successfully'),
        variant: 'default',
      });

      return savedId || configId;
    } catch (error) {
      toast({
        title: t('error'),
        description: t('failed-to-save-config'),
        variant: 'destructive',
      });
      throw error;
    }
  };

  return { saveConfig, loading: createLoading || updateLoading };
};
