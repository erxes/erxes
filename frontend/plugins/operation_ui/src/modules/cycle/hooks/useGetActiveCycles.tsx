import { useQuery } from '@apollo/client';
import { GET_ACTIVE_CYCLES } from '@/cycle/graphql/queries/getActiveCycles';
import { compactList } from '@/operation/utils/cursorList';

// Keyed by team only, so every task row of a team shares one cached result.
export const useGetActiveCycles = (teamId: string | null | undefined) => {
  const { data, loading } = useQuery(GET_ACTIVE_CYCLES, {
    variables: { teamId },
    skip: !teamId,
  });
  return {
    activeCycles: compactList(data?.getCyclesActive?.list),
    loading,
  };
};
