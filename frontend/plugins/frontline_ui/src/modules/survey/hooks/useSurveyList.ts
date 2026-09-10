import { QueryHookOptions, useQuery } from '@apollo/client';
import {
  EnumCursorDirection,
  mergeCursorData,
  validateFetchMore,
} from 'erxes-ui';
import {
  GET_SURVEY_LIST,
  GET_SURVEY_RESULTS_LIST,
} from '@/survey/graphql/surveyQueries';
import { ISurvey } from '@/survey/types/surveyTypes';

const SURVEYS_PER_PAGE = 24;

export const useSurveyList = (
  options?: QueryHookOptions & { withResults?: boolean },
) => {
  const { withResults, ...queryOptions } = options || {};

  const { data, loading, error, fetchMore, refetch } = useQuery(
    withResults ? GET_SURVEY_RESULTS_LIST : GET_SURVEY_LIST,
    {
      ...queryOptions,
      variables: {
        limit: SURVEYS_PER_PAGE,
        ...queryOptions?.variables,
      },
      fetchPolicy: 'cache-and-network',
    },
  );

  const {
    list: surveys,
    totalCount,
    pageInfo,
  } = data?.surveyList || ({} as { list?: ISurvey[] });

  const handleFetchMore = ({
    direction,
  }: {
    direction: EnumCursorDirection;
  }) => {
    if (!validateFetchMore({ direction, pageInfo })) return;

    fetchMore({
      variables: {
        cursor:
          direction === EnumCursorDirection.BACKWARD
            ? pageInfo?.startCursor
            : pageInfo?.endCursor,
        limit: SURVEYS_PER_PAGE,
        direction,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;

        return Object.assign({}, prev, {
          surveyList: mergeCursorData({
            direction,
            fetchMoreResult: fetchMoreResult.surveyList,
            prevResult: prev.surveyList,
          }),
        });
      },
    });
  };

  return {
    surveys: surveys as ISurvey[] | undefined,
    loading,
    error,
    totalCount,
    pageInfo,
    handleFetchMore,
    refetch,
  };
};
