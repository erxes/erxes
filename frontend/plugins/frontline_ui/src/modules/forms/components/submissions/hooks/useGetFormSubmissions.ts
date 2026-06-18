import { QueryHookOptions, useQuery } from '@apollo/client';
import {
  EnumCursorDirection,
  ICursorListResponse,
  mergeCursorData,
  validateFetchMore,
} from 'erxes-ui';
import { IFormSubmission } from '../types';
import { GET_FORM_SUBMISSIONS } from '../graphql/queries';

const SUBMISSIONS_PER_PAGE = 24;

export const useGetFormSubmissions = (options?: QueryHookOptions) => {
  const { data, loading, error, fetchMore } = useQuery<
    ICursorListResponse<IFormSubmission>
  >(GET_FORM_SUBMISSIONS, {
    fetchPolicy: 'cache-and-network',
    ...options,
    variables: {
      limit: SUBMISSIONS_PER_PAGE,
      ...options?.variables,
    },
  });

  const { list, totalCount, pageInfo } = data?.formSubmissions || {};

  const handleFetchMore = ({
    direction,
  }: {
    direction: EnumCursorDirection;
  }) => {
    if (!validateFetchMore({ direction, pageInfo })) return;
    fetchMore({
      variables: {
        cursor: pageInfo?.endCursor,
        limit: SUBMISSIONS_PER_PAGE,
        direction,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        return Object.assign({}, prev, {
          formSubmissions: mergeCursorData({
            direction,
            fetchMoreResult: fetchMoreResult.formSubmissions,
            prevResult: prev.formSubmissions,
          }),
        });
      },
    });
  };

  return {
    submissions: list || [],
    totalCount: totalCount || 0,
    pageInfo,
    loading,
    error,
    handleFetchMore,
  };
};
