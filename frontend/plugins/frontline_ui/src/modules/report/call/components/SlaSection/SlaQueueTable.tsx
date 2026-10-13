import { useTranslation } from 'react-i18next';
import { ReportTable } from '../ReportTable';
import { Meter, rateColorVar } from '../Meter';
import { NO_QUEUE, fmtNum, fmtPctOrDash } from '../../utils';
import type { SlaQueue } from '../../types';

interface SlaQueueTableProps {
  queues: SlaQueue[];
}

export function SlaQueueTable({ queues }: SlaQueueTableProps) {
  const { t } = useTranslation('frontline');

  if (!queues.length) {
    return (
      <ReportTable.Empty>
        {t('no-queue-data', 'No queue data for the selected range')}
      </ReportTable.Empty>
    );
  }

  return (
    <ReportTable>
      <ReportTable.Header>
        <ReportTable.HeaderRow>
          <ReportTable.Head>{t('queue', 'Queue')}</ReportTable.Head>
          <ReportTable.Head align="right">
            {t('sla-offered', 'Offered')}
          </ReportTable.Head>
          <ReportTable.Head align="right">
            {t('answered', 'Answered')}
          </ReportTable.Head>
          <ReportTable.Head align="right">
            {t('sla-breached', 'Breached')}
          </ReportTable.Head>
          <ReportTable.Head align="right">
            {t('sla-short-abandons', 'Short abandons')}
          </ReportTable.Head>
          <ReportTable.Head align="right">
            {t('sla-called-back', 'Called back')}
          </ReportTable.Head>
          <ReportTable.Head align="right" className="w-40">
            {t('kpi-service-level', 'Service Level')}
          </ReportTable.Head>
        </ReportTable.HeaderRow>
      </ReportTable.Header>
      <ReportTable.Body>
        {queues.map((row, i) => {
          const color = rateColorVar(row.serviceLevel);

          return (
            <ReportTable.Row key={row.queue} index={i}>
              <ReportTable.Cell>
                <span className="inline-flex items-center rounded-md border bg-muted/50 px-2 py-0.5 font-mono text-xs font-semibold">
                  {row.queue === NO_QUEUE
                    ? t('no-queue', { defaultValue: 'Outside a queue' })
                    : row.queue}
                </span>
              </ReportTable.Cell>
              <ReportTable.Cell
                align="right"
                numeric
                className="text-sm font-semibold"
              >
                {fmtNum(row.offeredCalls)}
              </ReportTable.Cell>
              <ReportTable.Cell align="right">
                <ReportTable.Badge tone="success">
                  {fmtNum(row.answeredCalls)}
                </ReportTable.Badge>
              </ReportTable.Cell>
              <ReportTable.Cell align="right">
                <ReportTable.Badge tone="destructive">
                  {fmtNum(row.breachedCalls)}
                </ReportTable.Badge>
              </ReportTable.Cell>
              <ReportTable.Cell align="right" numeric className="text-sm">
                {fmtNum(row.shortAbandonedCalls)}
              </ReportTable.Cell>
              <ReportTable.Cell align="right" numeric className="text-sm">
                {fmtNum(row.calledBackCalls)}
              </ReportTable.Cell>
              <ReportTable.Cell align="right" numeric className="w-40">
                <p className="text-sm font-semibold" style={{ color }}>
                  {fmtPctOrDash(row.serviceLevel)}
                </p>
                <Meter
                  className="mt-1.5"
                  value={row.serviceLevel ?? 0}
                  colorVar={color}
                />
              </ReportTable.Cell>
            </ReportTable.Row>
          );
        })}
      </ReportTable.Body>
    </ReportTable>
  );
}
