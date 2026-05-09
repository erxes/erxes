import { useMutation } from '@apollo/client';
import { toast } from 'erxes-ui';
import { WEB_PAGES_REMOVE } from '../graphql/mutations/webPagesRemove';
import { GET_WEB_PAGES } from '../graphql/queries/getWebPages';

export const useRemoveWebPage = (webId: string) => {
  const [mutate, { loading }] = useMutation(WEB_PAGES_REMOVE, {
    refetchQueries: [{ query: GET_WEB_PAGES, variables: { webId } }],
    onCompleted: () => {
      toast({ title: 'Success', description: 'Page removed.' });
    },
    onError: (e) => {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    },
  });

  const removeWebPage = (_id: string) => mutate({ variables: { _id } });

  return { removeWebPage, loading };
};
