import { QueryHookOptions, useQuery } from '@apollo/client';
import { EnumCursorDirection, validateFetchMore } from 'erxes-ui';
import {
  compactList,
  mergeCursorList,
  toCursorPageInfo,
} from '@/shared/utils/cursorList';
import { GET_FORM_SUBMISSIONS } from '../graphql/queries';
import type {
  FrontlineFormSubmissionsQuery,
  FrontlineFormSubmissionsQueryVariables,
} from '~/gql/graphql';

const SUBMISSIONS_PER_PAGE = 24;

export const useGetFormSubmissions = (
  options?: QueryHookOptions<
    FrontlineFormSubmissionsQuery,
    FrontlineFormSubmissionsQueryVariables
  >,
) => {
  const { data, loading, error, fetchMore, refetch } = useQuery(
    GET_FORM_SUBMISSIONS,
    {
      ...options,
      fetchPolicy: 'network-only',
      nextFetchPolicy: 'cache-first',
      notifyOnNetworkStatusChange: true,
      variables: {
        limit: SUBMISSIONS_PER_PAGE,
        ...options?.variables,
      },
    },
  );

  const submissions = compactList(data?.formSubmissions?.list);
  const pageInfo = toCursorPageInfo(data?.formSubmissions?.pageInfo);
  const totalCount = data?.formSubmissions?.totalCount ?? undefined;

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
        if (!fetchMoreResult.formSubmissions || !prev.formSubmissions) {
          return prev;
        }

        return {
          ...prev,
          formSubmissions: mergeCursorList(
            direction,
            prev.formSubmissions,
            fetchMoreResult.formSubmissions,
          ),
        };
      },
    });
  };

  return {
    submissions,
    totalCount,
    pageInfo,
    loading,
    error,
    handleFetchMore,
    refetch,
  };
};
