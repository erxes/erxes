import { useMutation } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { UPDATE_MN_CONFIG } from '@/ebarimt/settings/stage-in-return-ebarimt-config/graphql/queries/mnConfigs';

export const useUpdateEbarimtReturnConfig = () => {
  const { toast } = useToast();

  const [updateEbarimtReturnConfigMutation, { loading, error }] = useMutation(
    UPDATE_MN_CONFIG,
    {
      onCompleted: () => {
        toast({
          title: 'Success',
          description: 'Ebarimt return config updated successfully',
          variant: 'default',
        });
      },
      onError: (e) => {
        toast({
          title: 'Error',
          description: e.message,
          variant: 'destructive',
        });
      },
    },
  );

  return {
    updateEbarimtReturnConfig: updateEbarimtReturnConfigMutation,
    loading,
    error,
  };
};
