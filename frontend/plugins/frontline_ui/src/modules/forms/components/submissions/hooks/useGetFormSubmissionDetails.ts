import { QueryHookOptions, useQuery } from '@apollo/client';
import { IFormSubmission } from '../types';
import { GET_SUBMISSION_DETAILS } from '../graphql/queries';

export const useGetFormSubmissionDetails = (options?: QueryHookOptions) => {
  const { data, loading, error } = useQuery<{
    formSubmissionDetail: IFormSubmission;
  }>(GET_SUBMISSION_DETAILS, options);

  return {
    submissionDetails: data?.formSubmissionDetail,
    loading,
    error,
  };
};
