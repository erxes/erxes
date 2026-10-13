import { useQuery } from '@apollo/client';
import { useParams } from 'react-router';
import { GET_STATUSES_BY_TYPE } from '@/team/graphql/queries/getStatusesByType';
import { GET_STATUS_BY_TEAM } from '@/task/graphql/queries/getStatusByTeam';
import { compactList } from '@/operation/utils/cursorList';

export const useStatusesByType = ({ type }: { type: number }) => {
  const { id: teamId } = useParams();

  const { data, loading, refetch } = useQuery(GET_STATUSES_BY_TYPE, {
    variables: teamId ? { teamId, type } : undefined,
    skip: !teamId,
  });

  const statuses = compactList(data?.getStatusesByType);

  return { statuses, loading, refetch };
};

export const useGetStatusesByTeam = ({ teamId }: { teamId: string }) => {
  const { data, loading, refetch } = useQuery(GET_STATUS_BY_TEAM, {
    variables: { teamId },
  });

  const statuses = compactList(data?.getStatusesChoicesByTeam);

  return { statuses, loading, refetch };
};
