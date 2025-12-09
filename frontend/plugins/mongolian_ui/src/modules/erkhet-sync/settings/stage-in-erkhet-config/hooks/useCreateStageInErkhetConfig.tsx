import { useMutation } from '@apollo/client';
import { useToast, useRecordTableCursor } from 'erxes-ui';
import { CREATE_STAGE_IN_ERKHET_CONFIG } from '../graphql/mutations/createStageInErkhetConfigMutations';
import { STAGE_IN_ERKHET_CONFIG_CURSOR_SESSION_KEY } from '../constants';

export const useCreateStageInErkhetConfig = () => {
  const { toast } = useToast();
  const { setCursor } = useRecordTableCursor({
    sessionKey: STAGE_IN_ERKHET_CONFIG_CURSOR_SESSION_KEY,
  });

  const [createStageInErkhetConfigMutation, { loading, error }] = useMutation(
    CREATE_STAGE_IN_ERKHET_CONFIG,
    {
      onCompleted: () => {
        toast({
          title: 'Success',
          description: 'Stage in erkhet config created successfully',
          variant: 'default',
        });
        setCursor('');
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
    createStageInErkhetConfig: createStageInErkhetConfigMutation,
    loading,
    error,
  };
};
