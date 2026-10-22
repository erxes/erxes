import { useQuery } from '@apollo/client';
import { useQueryState } from 'erxes-ui';
import { GET_JOB_DETAIL } from '../graphql/jobQueries';

export const useJobDetail = () => {
  const [jobId, setJobId] = useQueryState<string>('job_id');
  const { data, loading } = useQuery(GET_JOB_DETAIL, {
    variables: { _id: jobId ?? '' },
    skip: !jobId,
  });

  return {
    jobDetail: data?.jobDetail,
    loading,
    closeDetail: () => setJobId(null),
  };
};
