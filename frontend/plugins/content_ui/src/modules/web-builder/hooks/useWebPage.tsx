import { useQuery } from '@apollo/client';
import { toast } from 'erxes-ui';
import { GET_WEB_PAGE } from '../graphql/queries/getWebPage';
import { IWebPage } from '../types';

export const useWebPage = (pageId: string) => {
  const { data, loading, error, refetch } = useQuery(GET_WEB_PAGE, {
    variables: { _id: pageId },
    skip: !pageId,
    fetchPolicy: 'cache-and-network',
    onError: (e) => {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    },
  });

  const page: IWebPage | null = data?.getWebPage || null;

  return { page, loading, error, refetch };
};
