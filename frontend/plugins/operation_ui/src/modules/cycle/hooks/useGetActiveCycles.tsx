import { useQuery } from '@apollo/client';
import { GET_ACTIVE_CYCLES } from '@/cycle/graphql/queries/getActiveCycles';
import { ICycle } from '@/cycle/types';

export const useGetActiveCycles = (
  teamId: string | undefined,
  taskId: string | undefined,
) => {
  const { data, loading } = useQuery<{
    getCyclesActive?: { list: ICycle[] };
  }>(GET_ACTIVE_CYCLES, {
    variables: {
      teamId,
      taskId,
    },
    skip: !teamId,
  });
  return { activeCycles: data?.getCyclesActive?.list, loading };
};
