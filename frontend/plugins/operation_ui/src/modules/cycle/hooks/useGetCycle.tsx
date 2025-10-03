import { useQuery } from '@apollo/client';
import { GET_CYCLE_DETAIL } from '@/cycle/graphql/queries/getCycle';
import { ICycle } from '@/cycle/types';

export const useGetCycle = (id: string | undefined) => {
  const { data, loading } = useQuery<{ getCycle?: ICycle }>(GET_CYCLE_DETAIL, {
    variables: {
      _id: id,
    },
    skip: !id,
  });
  return { cycleDetail: data?.getCycle, loading };
};
