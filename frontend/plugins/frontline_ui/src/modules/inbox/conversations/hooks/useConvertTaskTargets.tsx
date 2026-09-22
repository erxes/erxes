import { useQuery } from '@apollo/client';
import { useAtomValue } from 'jotai';
import { currentUserState } from 'ui-modules';
import {
  GET_CONVERT_TASK_STATUSES,
  GET_CONVERT_TASK_TEAMS,
} from '@/inbox/conversations/graphql/queries/getConvertTaskTargets';
import {
  IConvertTaskStatus,
  IConvertTaskTeam,
} from '@/inbox/conversations/types/conversationConvert';

export const useConvertTaskTeams = (skip?: boolean) => {
  const currentUser = useAtomValue(currentUserState);
  const { data, loading } = useQuery<{ getTeams: IConvertTaskTeam[] | null }>(
    GET_CONVERT_TASK_TEAMS,
    {
      variables: { userId: currentUser?._id },
      skip: skip || !currentUser?._id,
    },
  );

  return { teams: data?.getTeams || [], loading };
};

export const useConvertTaskStatuses = (teamId?: string) => {
  const { data, loading } = useQuery<{
    getStatusesChoicesByTeam: IConvertTaskStatus[] | null;
  }>(GET_CONVERT_TASK_STATUSES, {
    variables: { teamId },
    skip: !teamId,
  });

  return { statuses: data?.getStatusesChoicesByTeam || [], loading };
};
