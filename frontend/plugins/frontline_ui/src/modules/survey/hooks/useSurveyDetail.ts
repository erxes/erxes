import { QueryHookOptions, useQuery } from '@apollo/client';
import { GET_SURVEY_DETAIL } from '@/survey/graphql/surveyQueries';
import type {
  SurveyDetailQuery,
  SurveyDetailQueryVariables,
} from '~/gql/graphql';

export const useSurveyDetail = (
  options?: QueryHookOptions<SurveyDetailQuery, SurveyDetailQueryVariables>,
) => {
  const { data, loading, error } = useQuery(GET_SURVEY_DETAIL, {
    fetchPolicy: 'cache-and-network',
    ...options,
  });

  return {
    survey: data?.surveyDetail ?? undefined,
    loading,
    error,
  };
};
