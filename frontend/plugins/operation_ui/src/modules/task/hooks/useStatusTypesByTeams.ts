import { useApolloClient } from '@apollo/client';
import { compactList } from '@/operation/utils/cursorList';
import { GET_STATUS_BY_TEAM } from '@/task/graphql/queries/getStatusByTeam';
import { useEffect, useState } from 'react';

// Maps each team status id to its status type for the given teams. A task's
// `status` is the id only, so progress needs this to tell started from done.
export const useStatusTypesByTeams = (teamIds: string[]) => {
  const client = useApolloClient();
  const [statusTypes, setStatusTypes] = useState<Map<string, number>>(
    () => new Map(),
  );
  const teamIdsKey = [...new Set(teamIds)].sort().join(',');

  useEffect(() => {
    if (!teamIdsKey) return;
    let cancelled = false;

    Promise.all(
      teamIdsKey.split(',').map((teamId) =>
        client.query({ query: GET_STATUS_BY_TEAM, variables: { teamId } }),
      ),
    )
      .then((results) => {
        if (cancelled) return;
        const next = new Map<string, number>();
        results.forEach(({ data }) => {
          compactList(data?.getStatusesChoicesByTeam).forEach((status) => {
            if (status.value) next.set(status.value, status.type);
          });
        });
        setStatusTypes(next);
      })
      .catch(() => {
        if (!cancelled) setStatusTypes(new Map());
      });

    return () => {
      cancelled = true;
    };
  }, [client, teamIdsKey]);

  return statusTypes;
};
