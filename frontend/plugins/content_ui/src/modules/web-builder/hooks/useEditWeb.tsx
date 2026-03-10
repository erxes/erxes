import { useMutation } from '@apollo/client';
import { toast } from 'erxes-ui';
import { EDIT_WEB } from '../graphql/mutations/editWeb';
import { GET_WEB_LIST } from '../graphql/queries/getWebList';

export const useEditWeb = () => {
  const [editWebMutation, { loading }] = useMutation(EDIT_WEB, {
    refetchQueries: [{ query: GET_WEB_LIST }],
    onCompleted: () => {
      toast({ title: 'Success', description: 'Web project updated!' });
    },
    onError: (e) => {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    },
  });

  return { editWeb: editWebMutation, loading };
};
