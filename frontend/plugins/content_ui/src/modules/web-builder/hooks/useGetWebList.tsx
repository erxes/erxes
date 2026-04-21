import { useQuery } from '@apollo/client';
import { toast } from 'erxes-ui';
import { GET_WEB_LIST } from '../graphql/queries/getWebList';
import { IWeb } from '../types';

export const useGetWebList = () => {
  const { data, loading, error, refetch } = useQuery(GET_WEB_LIST, {
    onError: (e) => {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    },
  });

  const webs: IWeb[] = data?.getWebList || [];

  return { webs, loading, error, refetch };
};
