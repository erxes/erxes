import { useMutation } from '@apollo/client';
import {
  CREATE_MN_CONFIG,
  UPDATE_MN_CONFIG,
  GET_MN_CONFIGS,
} from '@/ebarimt/settings/stage-in-return-ebarimt-config/graphql/queries/mnConfigs';
import { useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

const refetchOptions = [{ query: GET_MN_CONFIGS, variables: { code: 'returnStageInEbarimt' } }];

export const useEbarimtReturnConfigSave = () => {
  const [createConfig, { loading: createLoading }] = useMutation(CREATE_MN_CONFIG, { refetchQueries: refetchOptions });
  const [updateConfig, { loading: updateLoading }] = useMutation(UPDATE_MN_CONFIG, { refetchQueries: refetchOptions });
  const loading = createLoading || updateLoading;
  const { toast } = useToast();
  const { t } = useTranslation('mongolian');

  const saveConfigsToServer = async (
    config: any,
    operation: 'create' | 'update',
    configId?: string,
  ) => {
    try {
      let result;

      if (operation === 'create' || !configId) {
        result = await createConfig({
          variables: {
            code: 'returnStageInEbarimt',
            subId: config.stageId,
            value: config,
          },
        });
      } else {
        result = await updateConfig({
          variables: {
            id: configId,
            subId: config.stageId,
            value: config,
          },
        });
      }

      toast({
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
      toast({
        title: t('error'),
        description: t('failed-to-save-config'),
        variant: 'destructive',
      });
      throw error;
    }
  };

  return { saveConfigsToServer, loading };
};
