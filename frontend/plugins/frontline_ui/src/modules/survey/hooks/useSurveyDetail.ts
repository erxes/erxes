import { QueryHookOptions, useQuery } from '@apollo/client';
import { GET_SURVEY_DETAIL } from '@/survey/graphql/surveyQueries';
import { ISurvey } from '@/survey/types/surveyTypes';

export const useSurveyDetail = (options?: QueryHookOptions) => {
  const { data, loading, error } = useQuery(GET_SURVEY_DETAIL, {
    fetchPolicy: 'cache-and-network',
    ...options,
  });

  return {
    survey: data?.surveyDetail as ISurvey | undefined,
    loading,
    error,
  };
};
