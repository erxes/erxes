import { useMutation } from '@apollo/client';
import { UPDATE_CONFIGS } from '../graphql';
import { toast } from 'erxes-ui';

export const useUpdateConfigs = () => {
  const [mutate, { loading }] = useMutation(UPDATE_CONFIGS, {
    onCompleted: () => {
      toast({
        variant: 'success',
        title: 'Configurations updated successfully',
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Failed to update configurations',
        description: error.message,
      });
    },
  });

  return {
    updateConfig: mutate,
    loading,
  };
};
