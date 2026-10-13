import { QueryHookOptions, useQuery } from '@apollo/client';
import { GET_ESTIMATE_CHOICE_BY_TEAM } from '../graphql/queries/getEstimateChoiceByTeam';
import { compactList } from '@/operation/utils/cursorList';
import {
  EstimateChoisesQuery,
  EstimateChoisesQueryVariables,
} from '~/gql/graphql';

export const useGetEstimateChoiceByTeam = (
  options: QueryHookOptions<
    EstimateChoisesQuery,
    EstimateChoisesQueryVariables
  >,
) => {
  const { data, loading, error } = useQuery(
    GET_ESTIMATE_CHOICE_BY_TEAM,
    options,
  );

  return {
    estimateChoices: compactList(data?.getTeamEstimateChoises),
    loading,
    error,
  };
};
