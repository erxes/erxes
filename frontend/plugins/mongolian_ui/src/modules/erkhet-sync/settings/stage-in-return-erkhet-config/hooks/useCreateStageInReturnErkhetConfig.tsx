import { useMutation } from '@apollo/client';
import { useToast, useRecordTableCursor } from 'erxes-ui';
import { CREATE_STAGE_IN_RETURN_ERKHET_CONFIG } from '@/erkhet-sync/settings/stage-in-return-erkhet-config/graphql/mutations/createStageInReturnErkhetConfigMutations';
import { STAGE_IN_RETURN_ERKHET_CONFIG_CURSOR_SESSION_KEY } from '@/erkhet-sync/settings/stage-in-return-erkhet-config/constants';

export const useCreateStageInReturnErkhetConfig = () => {
  const { toast } = useToast();
  const { setCursor } = useRecordTableCursor({
    sessionKey: STAGE_IN_RETURN_ERKHET_CONFIG_CURSOR_SESSION_KEY,
  });

  const [createStageInReturnErkhetConfigMutation, { loading, error }] =
    useMutation(CREATE_STAGE_IN_RETURN_ERKHET_CONFIG, {
      onCompleted: () => {
        toast({
          title: 'Success',
          description: 'Stage in return erkhet config created successfully',
          variant: 'default',
        });
        setCursor(null);
      },
      onError: (e) => {
        toast({
          title: 'Error',
          description: e.message,
          variant: 'destructive',
        });
      },
    });

  return {
    createStageInReturnErkhetConfig: createStageInReturnErkhetConfigMutation,
    loading,
    error,
  };
};
