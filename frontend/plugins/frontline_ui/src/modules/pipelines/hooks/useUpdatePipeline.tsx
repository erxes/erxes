import {
  ApolloError,
  MutationFunctionOptions,
  useMutation,
} from '@apollo/client';
import { UPDATE_PIPELINE } from '@/pipelines/graphql/mutations/updatePipeline';
import { useToast } from 'erxes-ui';
export const useUpdatePipeline = () => {
  const { toast } = useToast();
  const [_updatePipeline, { loading }] = useMutation(UPDATE_PIPELINE);
  const updatePipeline = (options: MutationFunctionOptions) => {
    return _updatePipeline({
      ...options,
      onCompleted: (data) => {
        toast({
          title: 'Pipeline updated successfully',
          variant: 'default',
        });
        options.onCompleted?.(data);
      },
      onError: (error: ApolloError) => {
        toast({
          title: 'Error',
          variant: 'destructive',
          description: error.message,
        });
        options.onError?.(error);
      },
      refetchQueries: ['GetTicketPipelines'],
    });
  };
  return { updatePipeline, loading };
};
