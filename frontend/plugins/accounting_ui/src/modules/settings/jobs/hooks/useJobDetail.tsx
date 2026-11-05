import { useQuery } from '@apollo/client';
import { GET_JOB_DETAIL } from '@/settings/jobs/graphql/jobQueries';

export const useJobDetail = (jobId: string) => {
  const { data, loading } = useQuery(GET_JOB_DETAIL, {
    variables: { _id: jobId },
    skip: !jobId,
  });

  return {
    jobDetail: data?.jobDetail,
    loading,
  };
};
