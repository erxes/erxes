import {
  OperationVariables,
  QueryHookOptions,
  QueryResult,
  useQuery,
} from '@apollo/client';
import {
  EnumCursorDirection,
  ICursorListResponse,
  mergeCursorData,
  validateFetchMore,
} from 'erxes-ui';
import { IFormSubmission } from '../types';
import { GET_FORM_SUBMISSIONS } from '../graphql/queries';

const SUBMISSIONS_PER_PAGE = 24;

type FormSubmissionsQueryResult = ICursorListResponse<IFormSubmission>;

interface UseGetFormSubmissionsResult {
  submissions: IFormSubmission[];
  totalCount: number | undefined;
  pageInfo: FormSubmissionsQueryResult[string]['pageInfo'] | undefined;
  loading: boolean;
  error: QueryResult<FormSubmissionsQueryResult, OperationVariables>['error'];
  handleFetchMore: (options: { direction: EnumCursorDirection }) => void;
  refetch: QueryResult<
    FormSubmissionsQueryResult,
    OperationVariables
  >['refetch'];
}

export const useGetFormSubmissions = (
  options?: QueryHookOptions,
): UseGetFormSubmissionsResult => {
  const { data, loading, error, fetchMore, refetch } =
    useQuery<FormSubmissionsQueryResult>(GET_FORM_SUBMISSIONS, {
      ...options,
      fetchPolicy: 'network-only',
      nextFetchPolicy: 'cache-first',
      notifyOnNetworkStatusChange: true,
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
    totalCount,
    pageInfo,
    loading,
    error,
    handleFetchMore,
    refetch,
  };
};
