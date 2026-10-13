import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'erxes-ui';
import {
  SLA_EXPORT_BREACH_LIMIT,
  useSlaExport,
  useSlaReport,
} from '../../hooks/useSlaReport';
import { useCallFilters } from '../../hooks/useCallFilters';
import { downloadSlaExcel } from '../../slaExcel';
import { SectionCard } from '../SectionCard';
import { CallbackMiniKpi } from '../CallbacksSection/CallbackMiniKpi';
import { rateColorVar } from '../Meter';
import { fmtNum, fmtPctOrDash } from '../../utils';
import {
  ALL_AGENTS,
  DEFAULT_CALLBACK_WINDOW_MINUTES,
  formatCallbackWindow,
} from './slaUtils';
import { SlaSettingsBar } from './SlaSettingsBar';
import { SlaTrendChart } from './SlaTrendChart';
import { SlaMissedReasons } from './SlaMissedReasons';
import { SlaQueueTable } from './SlaQueueTable';
import { SlaBreachTable } from './SlaBreachTable';

export function SlaSection() {
  const { t } = useTranslation('frontline');
  const { dateRangeLabel } = useCallFilters();
  const [agentExtension, setAgentExtension] = useState(ALL_AGENTS);
  const [callbackWindowMinutes, setCallbackWindowMinutes] = useState(
    DEFAULT_CALLBACK_WINDOW_MINUTES,
  );
  const [exporting, setExporting] = useState(false);

  const params = { agentExtension, callbackWindowMinutes };
  const { report, loading, error } = useSlaReport(params);
  const { loadForExport, loading: exportLoading } = useSlaExport(params);

  const summary = report?.summary;
  const serviceLevel = summary?.serviceLevel ?? null;
  const agents = report?.agents ?? [];

  const translate = (key: string, fallback: string) => t(key, fallback);

  const agentLabel = () => {
    if (agentExtension === ALL_AGENTS) {
      return t('all-agents', { defaultValue: 'All agents' });
    }
    const agent = agents.find(({ extension }) => extension === agentExtension);
    return agent?.name ? `${agent.name} · ${agent.extension}` : agentExtension;
  };

  const handleExport = async () => {
    if ((report?.breachCount ?? 0) > SLA_EXPORT_BREACH_LIMIT) {
      toast({
        title: t('sla-export-too-large', {
          defaultValue: 'Too many breaches to export',
        }),
        description: t('sla-export-narrow', {
          defaultValue:
            'This range holds {{count}} breaches. Narrow the date range to {{limit}} or fewer.',
          count: report?.breachCount,
          limit: SLA_EXPORT_BREACH_LIMIT,
        }),
        variant: 'destructive',
      });
      return;
    }

    setExporting(true);
    try {
      const full = await loadForExport();

      if (!full || !full.summary.totalCalls) {
        toast({
          title: t('call-history-export-empty', {
            defaultValue: 'Nothing to export',
          }),
          variant: 'destructive',
        });
        return;
      }

      await downloadSlaExcel({
        report: full,
        title: `${t('sla-report', 'SLA report')} · ${dateRangeLabel}`,
        agentLabel: agentLabel(),
        callbackWindowLabel: formatCallbackWindow(
          callbackWindowMinutes,
          translate,
        ),
        fileName: `call-sla-${dateRangeLabel.replace(/[^\w-]+/g, '-')}.xlsx`,
        t: translate,
      });

      toast({
        title: t('call-history-export-done', {
          defaultValue: 'Export downloaded',
        }),
      });
    } catch (exportError) {
      toast({
        title: t('something-went-wrong', 'Uh oh! Something went wrong.'),
        description: (exportError as Error).message,
        variant: 'destructive',
      });
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <SlaSettingsBar
        agents={agents}
        agentExtension={agentExtension}
        callbackWindowMinutes={callbackWindowMinutes}
        shortAbandonSeconds={report?.shortAbandonSeconds ?? 5}
        exporting={exporting || exportLoading || loading}
        onAgentChange={setAgentExtension}
        onCallbackWindowChange={setCallbackWindowMinutes}
        onExport={handleExport}
      />

      {error ? (
        <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-6 text-sm text-destructive">
          {t('sla-load-error', 'Could not load the SLA report.')}{' '}
          {error.message}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
            <CallbackMiniKpi
              label={t('kpi-service-level', 'Service Level')}
              value={loading ? '…' : fmtPctOrDash(serviceLevel)}
              accentVar={rateColorVar(serviceLevel)}
            />
            <CallbackMiniKpi
              label={t('sla-offered', 'Offered')}
              value={loading ? '…' : fmtNum(summary?.offeredCalls)}
            />
            <CallbackMiniKpi
              label={t('answered', 'Answered')}
              value={loading ? '…' : fmtNum(summary?.answeredCalls)}
            />
            <CallbackMiniKpi
              label={t('sla-breached', 'Breached')}
              value={loading ? '…' : fmtNum(summary?.breachedCalls)}
              accentVar="var(--destructive)"
            />
            <CallbackMiniKpi
              label={t('sla-called-back', 'Called back')}
              value={loading ? '…' : fmtNum(summary?.calledBackCalls)}
              accentVar="var(--success)"
            />
          </div>

          <SectionCard
            title={t('missed-reasons-title', 'Why calls were missed')}
            description={t(
              'missed-reasons-description',
              'Every unanswered inbound call, grouped by where the caller dropped off',
            )}
            accentClass="bg-[var(--destructive)]"
            loading={loading}
            skeletonHeight="h-64"
          >
            <SlaMissedReasons
              reasons={report?.missedReasons ?? []}
              byHour={report?.missedByHour ?? []}
              shortAbandonSeconds={report?.shortAbandonSeconds ?? 5}
            />
          </SectionCard>

          <SectionCard
            title={t('sla-trend', 'Service level trend')}
            description={t(
              'sla-answered-trend-description',
              'Daily share of offered calls that were answered',
            )}
            loading={loading}
            skeletonHeight="h-64"
          >
            <SlaTrendChart data={report?.series ?? []} />
          </SectionCard>

          <SectionCard
            title={t('sla-by-queue', 'Service level by queue')}
            description={t(
              'sla-answered-by-queue-description',
              'Answered share of offered calls in each queue',
            )}
            accentClass="bg-[var(--chart-2)]"
            loading={loading}
            skeletonHeight="h-32"
          >
            <SlaQueueTable queues={report?.queues ?? []} />
          </SectionCard>

          <SectionCard
            title={t('sla-breaches', 'SLA breaches')}
            description={t(
              'sla-unanswered-breaches-description',
              'Offered calls that nobody answered and were not called back',
            )}
            accentClass="bg-[var(--destructive)]"
            loading={loading}
            skeletonHeight="h-32"
          >
            <SlaBreachTable
              breaches={report?.breaches ?? []}
              breachCount={report?.breachCount ?? 0}
            />
          </SectionCard>
        </>
      )}
    </div>
  );
}
