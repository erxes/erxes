import { useMutation, MutationHookOptions } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { CONVERT_TRIAGE_TO_TASK } from '../graphql/mutations/convertTriage';

export const useConvertTriage = () => {
  const { toast } = useToast();
  const [convertTriageToTaskMutation, { loading, error }] = useMutation(
    CONVERT_TRIAGE_TO_TASK,
  );
  const convertTriageToTask = (options: MutationHookOptions) => {
    return convertTriageToTaskMutation({
      ...options,
      onError: (error) => {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      },
    });
  };
  return { convertTriageToTask, loading, error };
};
