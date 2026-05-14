import { useMutation } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { UPDATE_MN_CONFIG } from '@/ebarimt/settings/pos-in-ebarimt-config/graphql/mnConfigs';

export const useUpdatePosInEbarimtConfig = () => {
  const { toast } = useToast();

  const [updatePosInEbarimtConfigMutation, { loading, error }] = useMutation(
    UPDATE_MN_CONFIG,
    {
      onCompleted: () => {
        toast({
          title: 'Success',
          description: 'Pos in ebarimt config updated successfully',
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
    updatePosInEbarimtConfig: updatePosInEbarimtConfigMutation,
    loading,
    error,
  };
};
