import { useMutation } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { UPDATE_MN_CONFIG } from '@/ebarimt/settings/stage-in-ebarimt-config/graphql/queries/mnConfigs';

export const useUpdateStageInEbarimtConfig = () => {
  const { toast } = useToast();

  const [updateStageInEbarimtConfigMutation, { loading, error }] = useMutation(
    UPDATE_MN_CONFIG,
    {
      onCompleted: () => {
        toast({
          title: 'Success',
          description: 'Stage in ebarimt config updated successfully',
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
    updateStageInEbarimtConfig: updateStageInEbarimtConfigMutation,
    loading,
    error,
  };
};
