import { QueryHookOptions, useQuery } from '@apollo/client';
import { GET_SUBMISSION_DETAILS } from '../graphql/queries';
import type {
  FrontlineFormSubmissionDetailQuery,
  FrontlineFormSubmissionDetailQueryVariables,
} from '~/gql/graphql';

export const useGetFormSubmissionDetails = (
  options?: QueryHookOptions<
    FrontlineFormSubmissionDetailQuery,
    FrontlineFormSubmissionDetailQueryVariables
  >,
) => {
  const { data, loading, error } = useQuery(GET_SUBMISSION_DETAILS, options);

  return {
    submissionDetails: data?.formSubmissionDetail ?? undefined,
    loading,
    error,
  };
};
