import { useMutation } from '@apollo/client';
import { toast } from 'erxes-ui';
import { CREATE_WEB } from '../graphql/mutations/createWeb';
import { GET_WEB_LIST } from '../graphql/queries/getWebList';

export const useCreateWeb = () => {
  const [createWebMutation, { loading }] = useMutation(CREATE_WEB, {
    refetchQueries: [{ query: GET_WEB_LIST }],
    onCompleted: () => {
      toast({ title: 'Success', description: 'Web project created!' });
    },
    onError: (e) => {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    },
  });

  return { createWeb: createWebMutation, loading };
};
