import { useMutation } from '@apollo/client';
import { REMOVE_MN_CONFIG } from '@/ebarimt/settings/stage-in-return-ebarimt-config/graphql/queries/mnConfigs';
import { useToast } from 'erxes-ui';

export const useRemoveEbarimtReturnConfig = () => {
  const [removeConfig] = useMutation(REMOVE_MN_CONFIG);
  const { toast } = useToast();

  const removeEbarimtReturnConfig = async (configId: string) => {
    try {
      await removeConfig({
        variables: {
          id: configId,
        },
      });

      toast({
        title: 'Success',
        description: 'Configuration removed successfully',
        variant: 'default',
      });

      return 'success';
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to remove configuration',
        variant: 'destructive',
      });
      throw error;
    }
  };

  return { removeEbarimtReturnConfig };
};
