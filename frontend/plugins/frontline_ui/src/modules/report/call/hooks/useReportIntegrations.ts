import { useQuery } from '@apollo/client';
import { toast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

import { CALL_REPORT_INTEGRATIONS } from '@/integrations/call/graphql/queries/callConfigQueries';

export interface ReportIntegration {
  _id: string;
  inboxId: string;
  phone: string;
  queues?: string[];
  /** Human-readable names parallel to `queues` (same index). */
  queueNames?: string[];
}

/**
 * Integrations for the call reports page.
 *
 * Unlike `useCallUserIntegration` (softphone widget), this is NOT limited to
 * integrations where the current user is an operator — reports are read-only
 * analytics, so every integration is listed.
 */
export const useReportIntegrations = () => {
  const { t } = useTranslation('frontline');
  const { data, loading } = useQuery<{
    callReportIntegrations: ReportIntegration[];
  }>(CALL_REPORT_INTEGRATIONS, {
    onError: (e) => {
      toast({
        title: t('something-went-wrong-getting-user-integrations'),
        description: e.message,
        variant: 'destructive',
      });
    },
  });

  return { integrations: data?.callReportIntegrations ?? [], loading };
};
