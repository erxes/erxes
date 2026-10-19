import { QueryHookOptions, useQuery } from '@apollo/client';
import { useMemo } from 'react';
import { EnumCursorDirection, validateFetchMore } from 'erxes-ui';
import {
  GET_SURVEY_LIST,
  GET_SURVEY_RESULTS_LIST,
} from '@/survey/graphql/surveyQueries';
import {
  compactList,
  mergeCursorList,
  toCursorPageInfo,
} from '@/shared/utils/cursorList';
import type {
  SurveyListQuery,
  SurveyListQueryVariables,
  SurveyResultsListQuery,
  SurveyResultsListQueryVariables,
} from '~/gql/graphql';

const SURVEYS_PER_PAGE = 24;

export const useSurveyList = (
  options?: QueryHookOptions<SurveyListQuery, SurveyListQueryVariables>,
) => {
  const { data, loading, error, fetchMore, refetch } = useQuery(
    GET_SURVEY_LIST,
    {
      ...options,
      variables: {
        limit: SURVEYS_PER_PAGE,
        ...options?.variables,
      },
      fetchPolicy: 'cache-and-network',
    },
  );

  const surveys = useMemo(
    () =>
      data?.surveyList?.list ? compactList(data.surveyList.list) : undefined,
    [data?.surveyList?.list],
  );
  const pageInfo = useMemo(
    () => toCursorPageInfo(data?.surveyList?.pageInfo),
    [data?.surveyList?.pageInfo],
  );
  const totalCount = data?.surveyList?.totalCount ?? undefined;

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
        if (!fetchMoreResult.surveyList || !prev.surveyList) return prev;

        return {
          ...prev,
          surveyList: mergeCursorList(
            direction,
            prev.surveyList,
            fetchMoreResult.surveyList,
          ),
        };
      },
    });
  };

  return {
    surveys,
    loading,
    error,
    totalCount,
    pageInfo,
    handleFetchMore,
    refetch,
  };
};

export const useSurveyResultsList = (
  options?: QueryHookOptions<
    SurveyResultsListQuery,
    SurveyResultsListQueryVariables
  >,
) => {
  const { data, loading } = useQuery(GET_SURVEY_RESULTS_LIST, {
    ...options,
    variables: {
      limit: SURVEYS_PER_PAGE,
      ...options?.variables,
    },
    fetchPolicy: 'cache-and-network',
  });

  const surveys = useMemo(
    () =>
      data?.surveyList?.list ? compactList(data.surveyList.list) : undefined,
    [data?.surveyList?.list],
  );

  return { surveys, loading };
};
