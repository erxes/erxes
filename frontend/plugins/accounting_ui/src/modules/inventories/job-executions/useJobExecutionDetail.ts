import { useQuery } from '@apollo/client';
import { GET_EXECUTION_DETAIL } from '@/inventories/job-executions/graphql';

export const useJobExecutionDetail = (executionId?: string) => {
  const { data, loading, error } = useQuery(GET_EXECUTION_DETAIL, {
    variables: { _id: executionId ?? '' },
    skip: !executionId,
  });

  return {
    execution: data?.jobExecutionDetail,
    loading,
    error,
  };
};
