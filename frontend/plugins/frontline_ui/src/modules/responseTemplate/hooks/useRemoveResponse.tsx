import { useMutation } from '@apollo/client';
import { REMOVE_RESPONSE } from '../graphql/mutations/deleteResponse';
import { toast } from 'erxes-ui';
import { GET_RESPONSES } from '../graphql/queries/getResponses';

export const useRemoveResponse = () => {
  const [removeResponse, { loading, error }] = useMutation(REMOVE_RESPONSE, {
    onCompleted: () => {
      toast({ title: 'Response removed successfully' });
    },
    refetchQueries: [{ query: GET_RESPONSES }],
  });
  return { removeResponse, loading, error };
};
