import { QueryHookOptions, useQuery } from '@apollo/client';
import { GET_SURVEY_TOTAL_COUNT } from '@/survey/graphql/surveyQueries';

export const useSurveyTotalCount = (options?: QueryHookOptions) => {
  const { data, loading } = useQuery(GET_SURVEY_TOTAL_COUNT, {
    fetchPolicy: 'cache-and-network',
    ...options,
  });

  return {
    totalCount: data?.surveyTotalCount?.total as number | undefined,
    byStatus: data?.surveyTotalCount?.byStatus as
      | Record<string, number>
      | undefined,
    loading,
  };
};
