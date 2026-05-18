import { gql, useQuery } from '@apollo/client';
import { REPORT_TOTAL_MESSAGES } from '../graphql/queries/getChart';


export const useReportTotalMessages = () => {
  const { data, loading, error } = useQuery(REPORT_TOTAL_MESSAGES);

  return {
    totalMessages: data?.reportTotalMessages,
    loading,
    error,
  };
};