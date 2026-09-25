import { gql, useQuery } from '@apollo/client';

export const CALL_REPORT_INTEGRATIONS = gql`
  query callReportIntegrations {
    callReportIntegrations {
      _id
      inboxId
      phone
      queues
    }
  }
`;

export interface CallReportIntegration {
  _id: string;
  inboxId: string;
  phone: string;
  queues: string[];
}

export function useCallReportIntegrations() {
  const { data, loading, error } = useQuery<{
    callReportIntegrations: CallReportIntegration[];
  }>(CALL_REPORT_INTEGRATIONS);

  return {
    integrations: data?.callReportIntegrations ?? [],
    loading,
    error,
  };
}
