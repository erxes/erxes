import { useQuery } from '@apollo/client';
import { GET_ACTIVE_CYCLES } from '@/cycle/graphql/queries/getActiveCycles';
import { compactList } from '@/operation/utils/cursorList';

export const useGetActiveCycles = (
  teamId: string | null | undefined,
  taskId: string | null | undefined,
) => {
  const { data, loading } = useQuery(GET_ACTIVE_CYCLES, {
    variables: { teamId, taskId },
    skip: !teamId,
  });
  return {
    activeCycles: compactList(data?.getCyclesActive?.list),
    loading,
  };
};
