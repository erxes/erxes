import { gql, useLazyQuery, useQuery } from '@apollo/client';
import { CALL_SLA_REPORT } from '@/integrations/call/graphql/queries/callStatistics';
import type { SlaReport } from '../types';
import { useCallFilters } from './useCallFilters';

const SLA_BREACH_LIMIT = 50;

export const SLA_EXPORT_BREACH_LIMIT = 5000;

interface SlaReportParams {
  agentExtension: string;
  callbackWindowMinutes: number;
}

function useSlaVariables({
  agentExtension,
  callbackWindowMinutes,
}: SlaReportParams) {
  const { startDate, endDate, integrationId, queueId } = useCallFilters();

  return {
    integrationId,
    variables: {
      startDate,
      endDate,
      integrationId: integrationId || undefined,
      queueId: queueId && queueId !== 'all' ? queueId : undefined,
      agentExtension: agentExtension !== 'all' ? agentExtension : undefined,
      callbackWindowMinutes,
    },
  };
}

export function useSlaReport(params: SlaReportParams) {
  const { integrationId, variables } = useSlaVariables(params);

  const { data, loading, error } = useQuery<{ callSlaReport: SlaReport }>(
    gql(CALL_SLA_REPORT),
    {
      variables: { ...variables, breachLimit: SLA_BREACH_LIMIT },
      skip: !integrationId,
    },
  );

  return {
    report: data?.callSlaReport ?? null,
    loading,
    error,
  };
}

export function useSlaExport(params: SlaReportParams) {
  const { variables } = useSlaVariables(params);

  const [fetchReport, { loading }] = useLazyQuery<{
    callSlaReport: SlaReport;
  }>(gql(CALL_SLA_REPORT), { fetchPolicy: 'network-only' });

  const loadForExport = async (): Promise<SlaReport | null> => {
    const { data } = await fetchReport({
      variables: { ...variables, breachLimit: SLA_EXPORT_BREACH_LIMIT },
    });

    return data?.callSlaReport ?? null;
  };

  return { loadForExport, loading };
}
