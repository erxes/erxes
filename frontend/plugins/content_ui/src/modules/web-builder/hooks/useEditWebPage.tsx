import { useMutation } from '@apollo/client';
import { toast } from 'erxes-ui';
import { WEB_PAGES_EDIT } from '../graphql/mutations/webPagesEdit';

export const useEditWebPage = () => {
  const [mutate, { loading }] = useMutation(WEB_PAGES_EDIT, {
    onError: (e) => {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    },
  });

  return { editWebPage: mutate, loading };
};
