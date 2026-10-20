import { QueryHookOptions, useQuery } from '@apollo/client';
import { GET_SURVEY_TOTAL_COUNT } from '@/survey/graphql/surveyQueries';
import type {
  SurveyTotalCountQuery,
  SurveyTotalCountQueryVariables,
} from '~/gql/graphql';

export const useSurveyTotalCount = (
  options?: QueryHookOptions<
    SurveyTotalCountQuery,
    SurveyTotalCountQueryVariables
  >,
) => {
  const { data, loading } = useQuery(GET_SURVEY_TOTAL_COUNT, {
    fetchPolicy: 'cache-and-network',
    ...options,
  });

  return {
    totalCount: data?.surveyTotalCount?.total ?? undefined,
    byStatus: data?.surveyTotalCount?.byStatus,
    loading,
  };
};
