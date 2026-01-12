import { useMutation } from '@apollo/client';
import { useToast, useRecordTableCursor } from 'erxes-ui';
import { CREATE_STAGE_IN_MOVEMENT_ERKHET_CONFIG } from '../graphql/mutations/createStageInErkhetMovementConfigMutations';
import { STAGE_IN_MOVEMENT_ERKHET_CONFIG_CURSOR_SESSION_KEY } from '../constants';

export const useCreateStageInErkhetMovementConfig = () => {
  const { toast } = useToast();
  const { setCursor } = useRecordTableCursor({
    sessionKey: STAGE_IN_MOVEMENT_ERKHET_CONFIG_CURSOR_SESSION_KEY,
  });

  const [createStageInErkhetMovementConfigMutation, { loading, error }] =
    useMutation(CREATE_STAGE_IN_MOVEMENT_ERKHET_CONFIG, {
      onCompleted: () => {
        toast({
          title: 'Success',
          description: 'Stage in erkhet movement config created successfully',
          variant: 'default',
        });
        setCursor("");
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
    createStageInErkhetMovementConfig:
      createStageInErkhetMovementConfigMutation,
    loading,
    error,
  };
};
