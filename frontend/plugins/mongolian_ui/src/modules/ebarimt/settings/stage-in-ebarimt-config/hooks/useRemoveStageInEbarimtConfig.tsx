import { useMutation } from '@apollo/client';
import { REMOVE_MN_CONFIG, GET_MN_CONFIGS } from '@/ebarimt/settings/stage-in-ebarimt-config/graphql/queries/mnConfigs';
import { useToast } from 'erxes-ui';

export const useRemoveStageInEbarimtConfig = () => {
  const [removeConfig] = useMutation(REMOVE_MN_CONFIG, {
    refetchQueries: [{ query: GET_MN_CONFIGS, variables: { code: 'stageInEbarimt' } }],
  });
  const { toast } = useToast();

  const removeStageInEbarimtConfig = async (configId: string) => {
    try {
      await removeConfig({
        variables: {
          id: configId,
        },
      });

      toast({
        title: 'Success',
        description: 'Configuration deleted successfully',
        variant: 'default',
      });
    } catch (error) {
      console.error('Error removing config:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete configuration',
        variant: 'destructive',
      });
      throw error;
    }
  };

  return {
    removeStageInEbarimtConfig,
  };
};
