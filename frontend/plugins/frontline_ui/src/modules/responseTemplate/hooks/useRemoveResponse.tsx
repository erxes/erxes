import { useMutation } from '@apollo/client';
import { REMOVE_RESPONSE } from '../graphql/mutations/deleteResponse';
import { toast } from 'erxes-ui';

export const useRemoveResponse = () => {
  const [removeResponse, { loading, error }] = useMutation(REMOVE_RESPONSE, {
    onCompleted: () => {
      toast({ title: 'Response removed successfully' });
    },
    refetchQueries: ['GetResponses'],
  });
  return { removeResponse, loading, error };
};
