import { useMutation } from '@apollo/client';
import {
  CREATE_MN_CONFIG,
  UPDATE_MN_CONFIG,
} from '@/ebarimt/settings/stage-in-return-ebarimt-config/graphql/queries/mnConfigs';
import { useToast } from 'erxes-ui';

export const useEbarimtReturnConfigSave = () => {
  const [createConfig] = useMutation(CREATE_MN_CONFIG);
  const [updateConfig] = useMutation(UPDATE_MN_CONFIG);
  const { toast } = useToast();

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
        title: 'Success',
        description: 'Configuration saved successfully',
        variant: 'default',
      });

      return (
        result?.data?.mnConfigsCreate?._id ||
        result?.data?.mnConfigsUpdate?._id ||
        configId
      );
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save configuration',
        variant: 'destructive',
      });
      throw error;
    }
  };

  return { saveConfigsToServer };
};
