import { useQuery } from '@apollo/client';
import { GET_CYCLE_DETAIL } from '@/cycle/graphql/queries/getCycle';

export const useGetCycle = (id: string | null | undefined) => {
  const { data, loading } = useQuery(GET_CYCLE_DETAIL, {
    variables: id ? { _id: id } : undefined,
    skip: !id,
  });
  return { cycleDetail: data?.getCycle, loading };
};
