import { useQuery } from '@apollo/client';
import { useQueryState } from 'erxes-ui';
import { GET_JOB_DETAIL } from '../graphql/jobQueries';
import { normalizeJob } from '../utils/normalizeJob';
import { useMemo } from 'react';

export const useJobDetail = () => {
  const [jobId, setJobId] = useQueryState<string>('job_id');
  const { data, loading } = useQuery(GET_JOB_DETAIL, {
    variables: { _id: jobId ?? '' },
    skip: !jobId,
  });

  const jobDetail = useMemo(
    () => (data?.jobDetail ? normalizeJob(data.jobDetail) : undefined),
    [data?.jobDetail],
  );
  return {
    jobDetail,
    loading,
    closeDetail: () => setJobId(null),
  };
};
