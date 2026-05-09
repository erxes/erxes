import { useQuery } from '@apollo/client';
import { toast } from 'erxes-ui';
import { GET_WEB_PAGES } from '../graphql/queries/getWebPages';
import { IWebPage } from '../types';

export const useWebPages = (webId: string, searchValue?: string) => {
  const { data, loading, error, refetch } = useQuery(GET_WEB_PAGES, {
    variables: { webId, searchValue },
    skip: !webId,
    fetchPolicy: 'cache-and-network',
    onError: (e) => {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    },
  });

  const pages: IWebPage[] = data?.getWebPages || [];

  return { pages, loading, error, refetch };
};
