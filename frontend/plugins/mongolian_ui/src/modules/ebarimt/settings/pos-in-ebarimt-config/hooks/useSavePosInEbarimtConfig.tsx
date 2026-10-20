import { useMutation } from '@apollo/client';
import { normalizeRuleIds } from '@/ebarimt/settings/pos-in-ebarimt-config/types';
import { useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import {
  CREATE_MN_CONFIG,
  GET_MN_CONFIGS,
  UPDATE_MN_CONFIG,
} from '@/shared/graphql/mnConfigs';

const refetchOptions = [
  { query: GET_MN_CONFIGS, variables: { code: 'posInEbarimt' } },
];

export const useSavePosInEbarimtConfig = () => {
  const { t } = useTranslation('mongolian');
  const [createConfig, { loading: createLoading }] = useMutation(
    CREATE_MN_CONFIG,
    {
      refetchQueries: refetchOptions,
      awaitRefetchQueries: true,
    },
  );
  const [updateConfig, { loading: updateLoading }] = useMutation(
    UPDATE_MN_CONFIG,
    {
      refetchQueries: refetchOptions,
      awaitRefetchQueries: true,
    },
  );
  const loading = createLoading || updateLoading;
  const toast = useToast();

  const savePosInEbarimtConfig = async (
    config: any,
    operation: 'create' | 'update',
    configId?: string,
  ) => {
    try {
      let result;
      const value = {
        ...config,
        reverseVatRules: normalizeRuleIds(config.reverseVatRules),
        reverseCtaxRules: normalizeRuleIds(config.reverseCtaxRules),
      };

      if (operation === 'create' || !configId) {
        result = await createConfig({
          variables: {
            code: 'posInEbarimt',
            subId: config.posId,
            value,
          },
        });
      } else {
        result = await updateConfig({
          variables: {
            id: configId,
            subId: config.posId,
            value,
          },
        });
      }

      toast.toast({
        title: t('success'),
        description: t('config-saved-successfully'),
        variant: 'default',
      });

      const saved = result?.data;
      const savedId = !saved
        ? undefined
        : 'mnConfigsCreate' in saved
        ? saved.mnConfigsCreate?._id
        : saved.mnConfigsUpdate?._id;

      return savedId || configId;
    } catch (error) {
      toast.toast({
        title: t('error'),
        description: t('failed-to-save-config'),
        variant: 'destructive',
      });
      throw error;
    }
  };

  return { savePosInEbarimtConfig, loading };
};
