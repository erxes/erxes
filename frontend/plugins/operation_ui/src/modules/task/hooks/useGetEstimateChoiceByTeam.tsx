import { QueryHookOptions, useQuery } from '@apollo/client';
import { GET_ESTIMATE_CHOICE_BY_TEAM } from '../graphql/queries/getEstimateChoiceByTeam';
import { IEstimateChoice } from '@/task/types';

interface IUseGetEstimateChoiceByTeamResponse {
  getTeamEstimateChoises: IEstimateChoice[];
}

export const useGetEstimateChoiceByTeam = (options: QueryHookOptions) => {
  const { data, loading, error } =
    useQuery<IUseGetEstimateChoiceByTeamResponse>(
      GET_ESTIMATE_CHOICE_BY_TEAM,
      options,
    );

  return {
    estimateChoices: data?.getTeamEstimateChoises || [],
    loading,
    error,
  };
};
