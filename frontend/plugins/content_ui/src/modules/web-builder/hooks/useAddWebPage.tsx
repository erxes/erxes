import { useMutation } from '@apollo/client';
import { toast } from 'erxes-ui';
import { WEB_PAGES_ADD } from '../graphql/mutations/webPagesAdd';
import { GET_WEB_PAGES } from '../graphql/queries/getWebPages';

export const useAddWebPage = (webId: string) => {
  const [mutate, { loading }] = useMutation(WEB_PAGES_ADD, {
    refetchQueries: [{ query: GET_WEB_PAGES, variables: { webId } }],
    onCompleted: () => {
      toast({ title: 'Success', description: 'Page created.' });
    },
    onError: (e) => {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    },
  });

  return { addWebPage: mutate, loading };
};
