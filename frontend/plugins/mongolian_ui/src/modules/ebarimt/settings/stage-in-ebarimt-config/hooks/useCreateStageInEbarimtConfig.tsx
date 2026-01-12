import { useMutation } from '@apollo/client';
import { useToast, useRecordTableCursor } from 'erxes-ui';
import { STAGE_IN_EBARIMT_CONFIG_CURSOR_SESSION_KEY } from '@/ebarimt/settings/stage-in-ebarimt-config/constants';
import { CREATE_STAGE_IN_EBARIMT_CONFIG } from '@/ebarimt/settings/stage-in-ebarimt-config/graphql/mutations/stageInEbarimtConfigMutations';

export const useCreateStageInEbarimtConfig = () => {
  const { toast } = useToast();
  const { setCursor } = useRecordTableCursor({
    sessionKey: STAGE_IN_EBARIMT_CONFIG_CURSOR_SESSION_KEY,
  });

  const [createStageInEbarimtConfigMutation, { loading, error }] = useMutation(
    CREATE_STAGE_IN_EBARIMT_CONFIG,
    {
      onCompleted: () => {
        toast({
          title: 'Success',
          description: 'Stage in ebarimt config created successfully',
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
    },
  );

  return {
    createStageInEbarimtConfig: createStageInEbarimtConfigMutation,
    loading,
    error,
  };
};
