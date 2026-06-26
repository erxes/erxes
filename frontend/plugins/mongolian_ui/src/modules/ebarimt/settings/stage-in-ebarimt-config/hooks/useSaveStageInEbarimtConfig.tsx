import { useMutation } from '@apollo/client';
import {
  CREATE_MN_CONFIG,
  UPDATE_MN_CONFIG,
  GET_MN_CONFIGS,
} from '@/ebarimt/settings/stage-in-ebarimt-config/graphql/queries/mnConfigs';
import { normalizeRuleIds } from '@/ebarimt/settings/stage-in-ebarimt-config/types';
import { useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

const refetchOptions = [
  { query: GET_MN_CONFIGS, variables: { code: 'stageInEbarimt' } },
];

export const useSaveStageInEbarimtConfig = () => {
  const [createConfig] = useMutation(CREATE_MN_CONFIG, {
    refetchQueries: refetchOptions,
  });
  const [updateConfig] = useMutation(UPDATE_MN_CONFIG, {
    refetchQueries: refetchOptions,
  });
  const toast = useToast();
  const { t } = useTranslation('mongolian');

  const saveStageInEbarimtConfig = async (
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
            code: 'stageInEbarimt',
            subId: config.stageId,
            value,
          },
        });
      } else {
        result = await updateConfig({
          variables: {
            id: configId,
            subId: config.stageId,
            value,
          },
        });
      }

      toast.toast({
        title: t('success'),
        description: t('config-saved-successfully'),
        variant: 'default',
      });

      return (
        result?.data?.mnConfigsCreate?._id ||
        result?.data?.mnConfigsUpdate?._id ||
        configId
      );
    } catch (error) {
      toast.toast({
        title: t('error'),
        description: t('failed-to-save-config'),
        variant: 'destructive',
      });
      throw error;
    }
  };

  return { saveStageInEbarimtConfig };
};
