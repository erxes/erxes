import { useQuery } from '@apollo/client';
import { useParams } from 'react-router';
import { GET_STATUSES_BY_TYPE } from '@/team/graphql/queries/getStatusesByType';
import { ITeamStatus } from '@/team/types';

interface IUseGetStatusByTypeResponse {
  getStatusesByType: ITeamStatus[];
  loading: boolean;
  refetch: any;
}

interface IUseGetStatusByTeamResponse {
  getStatusesChoicesByTeam: ITeamStatus[];
  loading: boolean;
  refetch: any;
}

export const useStatusesByType = ({ type }: { type: number }) => {
  const { id: teamId } = useParams();

  const { data, loading, refetch } = useQuery<IUseGetStatusByTypeResponse>(
    GET_STATUSES_BY_TYPE,
    {
      variables: {
        teamId,
        type,
      },
    },
  );

  const statuses = data?.getStatusesByType;

  return { statuses, loading, refetch };
};

export const useGetStatusesByTeam = ({ teamId }: { teamId: string }) => {
  const { data, loading, refetch } = useQuery<IUseGetStatusByTeamResponse>(
    GET_STATUSES_BY_TYPE,
    {
      variables: {
        teamId,
      },
    },
  );

  const statuses = data?.getStatusesChoicesByTeam;

  return { statuses, loading, refetch };
};
