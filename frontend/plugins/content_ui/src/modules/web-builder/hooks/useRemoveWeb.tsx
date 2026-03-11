import { useMutation } from '@apollo/client';
import { toast } from 'erxes-ui';
import { REMOVE_WEB } from '../graphql/mutations/removeWeb';
import { GET_WEB_LIST } from '../graphql/queries/getWebList';

export const useRemoveWeb = () => {
  const [removeWebMutation, { loading }] = useMutation(REMOVE_WEB, {
    refetchQueries: [{ query: GET_WEB_LIST }],
    onCompleted: () => {
      toast({ title: 'Success', description: 'Web project removed!' });
    },
    onError: (e) => {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    },
  });

  const removeWeb = (id: string) => removeWebMutation({ variables: { id } });

  return { removeWeb, loading };
};
