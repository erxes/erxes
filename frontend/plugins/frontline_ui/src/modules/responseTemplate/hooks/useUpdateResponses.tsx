import {
  ApolloError,
  MutationFunctionOptions,
  useMutation,
} from '@apollo/client';
import { UPDATE_RESPONSE } from '@/responseTemplate/graphql/mutations/updateResponse';
import { useToast } from 'erxes-ui';
export const useUpdateResponse = () => {
  const { toast } = useToast();
  const [_updateResponse, { loading }] = useMutation(UPDATE_RESPONSE);
  const updateResponse = (options: MutationFunctionOptions) => {
    return _updateResponse({
      ...options,
      onCompleted: (data) => {
        toast({
          title: 'Response updated successfully',
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
      refetchQueries: ['GetResponses'],
    });
  };
  return { updateResponse, loading };
};
