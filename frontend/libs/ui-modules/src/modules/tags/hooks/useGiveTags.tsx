import { OperationVariables, useMutation } from '@apollo/client';
import { GIVE_TAGS } from '../graphql/mutations/tagsMutations';
import { toast } from 'erxes-ui';

export const useGiveTags = (operationVariables?: OperationVariables) => {
  const [giveTags, { loading }] = useMutation(GIVE_TAGS, {
    ...operationVariables,
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
      operationVariables?.onError?.(error);
    },
  });

  return { giveTags, loading };
};
