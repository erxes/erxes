import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { ReportTable } from '../ReportTable';
import { NO_DATA, fmtDur, fmtNum } from '../../utils';
import type { SlaBreach } from '../../types';

interface SlaBreachTableProps {
  breaches: SlaBreach[];
  breachCount: number;
}

export function SlaBreachTable({ breaches, breachCount }: SlaBreachTableProps) {
  const { t } = useTranslation('frontline');

  const breachOutcome = (breach: SlaBreach): string => {
    if (breach.isPendingCallback) {
      return t('sla-awaiting-callback', 'Awaiting callback');
    }
    return t('sla-abandoned', 'Abandoned');
  };

  if (!breaches.length) {
    return (
      <ReportTable.Empty>
        {t('sla-no-breaches', 'No SLA breaches in the selected range')}
      </ReportTable.Empty>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <ReportTable>
        <ReportTable.Header>
          <ReportTable.HeaderRow>
            <ReportTable.Head>{t('time', 'Time')}</ReportTable.Head>
            <ReportTable.Head>{t('phone', 'Phone')}</ReportTable.Head>
            <ReportTable.Head>{t('queue', 'Queue')}</ReportTable.Head>
            <ReportTable.Head>{t('agent', 'Agent')}</ReportTable.Head>
            <ReportTable.Head align="right">
              {t('sla-waited', 'Waited')}
            </ReportTable.Head>
            <ReportTable.Head align="right">
              {t('outcome', 'Outcome')}
            </ReportTable.Head>
          </ReportTable.HeaderRow>
        </ReportTable.Header>
        <ReportTable.Body>
          {breaches.map((breach, i) => (
            <ReportTable.Row key={breach.uniqueid} index={i}>
              <ReportTable.Cell numeric className="text-sm">
                {breach.startedAt
                  ? format(new Date(breach.startedAt), 'MMM dd, HH:mm:ss')
                  : NO_DATA}
              </ReportTable.Cell>
              <ReportTable.Cell className="font-mono text-sm">
                {breach.customerPhone || NO_DATA}
              </ReportTable.Cell>
              <ReportTable.Cell className="font-mono text-xs">
                {breach.queue || NO_DATA}
              </ReportTable.Cell>
              <ReportTable.Cell className="text-sm">
                {breach.agentName ? (
                  <>
                    {breach.agentName}
                    <span className="ml-1 font-mono text-xs text-muted-foreground">
                      {breach.agent}
                    </span>
                  </>
                ) : (
                  <span className="font-mono text-xs">
                    {breach.agent || NO_DATA}
                  </span>
                )}
              </ReportTable.Cell>
              <ReportTable.Cell
                align="right"
                numeric
                className="font-mono text-sm font-semibold"
              >
                {fmtDur(breach.waitTime)}
              </ReportTable.Cell>
              <ReportTable.Cell align="right">
                <ReportTable.Badge
                  tone={breach.isPendingCallback ? 'warning' : 'destructive'}
                >
                  {breachOutcome(breach)}
                </ReportTable.Badge>
              </ReportTable.Cell>
            </ReportTable.Row>
          ))}
        </ReportTable.Body>
      </ReportTable>
      {breachCount > breaches.length && (
        <p className="text-xs text-muted-foreground">
          {t('sla-breaches-truncated', {
            defaultValue:
              'Showing the {{shown}} most recent of {{total}} breaches.',
            shown: fmtNum(breaches.length),
            total: fmtNum(breachCount),
          })}
        </p>
      )}
    </div>
  );
}
