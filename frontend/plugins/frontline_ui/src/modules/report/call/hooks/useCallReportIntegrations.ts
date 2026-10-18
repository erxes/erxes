import { useQuery } from '@apollo/client';
import { gql } from '~/gql';
import type { CallReportIntegrationsQuery } from '~/gql/graphql';

export const CALL_REPORT_INTEGRATIONS = gql(`
  query callReportIntegrations {
    callReportIntegrations {
      _id
      inboxId
      phone
      queues
    }
  }
`);

export type CallReportIntegration =
  CallReportIntegrationsQuery['callReportIntegrations'][number];

export function useCallReportIntegrations() {
  const { data, loading, error } = useQuery(CALL_REPORT_INTEGRATIONS);

  return {
    integrations: data?.callReportIntegrations ?? [],
    loading,
    error,
  };
}
