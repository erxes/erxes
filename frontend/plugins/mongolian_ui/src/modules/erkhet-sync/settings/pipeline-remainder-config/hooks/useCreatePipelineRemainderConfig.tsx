import { useMutation } from '@apollo/client';
import { useToast, useRecordTableCursor } from 'erxes-ui';
import { CREATE_PIPELINE_REMAINDER_CONFIG } from '../graphql/mutations/createPipelineRemainderConfigMutations';
import { PIPELINE_REMAINDER_CONFIG_CURSOR_SESSION_KEY } from '../constants';

export const useCreatePipelineRemainderConfig = () => {
  const { toast } = useToast();
  const { setCursor } = useRecordTableCursor({
    sessionKey: PIPELINE_REMAINDER_CONFIG_CURSOR_SESSION_KEY,
  });

  const [createPipelineRemainderConfigMutation, { loading, error }] =
    useMutation(CREATE_PIPELINE_REMAINDER_CONFIG, {
      onCompleted: () => {
        toast({
          title: 'Success',
          description: 'Pipeline remainder config created successfully',
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
    });

  return {
    createPipelineRemainderConfig: createPipelineRemainderConfigMutation,
    loading,
    error,
  };
};
