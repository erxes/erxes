import { useTranslation } from 'react-i18next';
import { useCallbackStats } from '../../hooks/useCallbackStats';
import { CallbackMiniKpi } from './CallbackMiniKpi';
import { SectionCard } from '../SectionCard';
import { Meter, rateColorVar } from '../Meter';
import { ReportTable } from '../ReportTable';
import { fmt, fmtNum, fmtPct } from '../../utils';

export function CallbacksSection() {
  const { t } = useTranslation('frontline');
  const { stats, loading } = useCallbackStats();

  const totals = stats.reduce(
    (acc, s) => ({
      missed: acc.missed + s.totalMissedCalls,
      attempts: acc.attempts + s.callbackAttempts,
      successful: acc.successful + s.successfulCallbacks,
      pending: acc.pending + s.pendingCallbacks,
    }),
    { missed: 0, attempts: 0, successful: 0, pending: 0 },
  );

  const overallRate =
    totals.missed > 0 ? (totals.successful / totals.missed) * 100 : 0;

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <CallbackMiniKpi
          label={t('missed-calls')}
          value={fmtNum(totals.missed)}
          accentVar="var(--destructive)"
        />
        <CallbackMiniKpi
          label={t('cb-attempts')}
          value={fmtNum(totals.attempts)}
        />
        <CallbackMiniKpi
          label={t('successful')}
          value={fmtNum(totals.successful)}
          accentVar="var(--success)"
        />
        <CallbackMiniKpi
          label={t('recovery-rate')}
          value={fmtPct(overallRate)}
          accentVar={rateColorVar(overallRate)}
        />
      </div>

      <SectionCard
        title={t('callback-recovery')}
        description={t('per-queue-missed-call-follow-up')}
        accentClass="bg-[var(--warning)]"
        loading={loading}
        skeletonHeight="h-32"
      >
        {!stats.length ? (
          <ReportTable.Empty>{t('no-callback-data')}</ReportTable.Empty>
        ) : (
          <ReportTable>
            <ReportTable.Header>
              <ReportTable.HeaderRow>
                <ReportTable.Head>{t('queue')}</ReportTable.Head>
                <ReportTable.Head align="right">{t('missed')}</ReportTable.Head>
                <ReportTable.Head align="right">
                  {t('cb-attempts')}
                </ReportTable.Head>
                <ReportTable.Head align="right">
                  {t('successful')}
                </ReportTable.Head>
                <ReportTable.Head align="right">
                  {t('pending')}
                </ReportTable.Head>
                <ReportTable.Head align="right" className="w-40">
                  {t('cb-rate')}
                </ReportTable.Head>
                <ReportTable.Head align="right">
                  {t('avg-cb-time')}
                </ReportTable.Head>
              </ReportTable.HeaderRow>
            </ReportTable.Header>
            <ReportTable.Body>
              {stats.map((row, i) => (
                <ReportTable.Row key={`${row.queue}-${i}`} index={i}>
                  <ReportTable.Cell>
                    <span className="inline-flex items-center rounded-md border bg-muted/50 px-2 py-0.5 font-mono text-xs font-semibold">
                      {row.queue || '—'}
                    </span>
                  </ReportTable.Cell>
                  <ReportTable.Cell
                    align="right"
                    numeric
                    className="text-sm font-semibold"
                  >
                    {fmtNum(row.totalMissedCalls)}
                  </ReportTable.Cell>
                  <ReportTable.Cell align="right" numeric className="text-sm">
                    {fmtNum(row.callbackAttempts)}
                  </ReportTable.Cell>
                  <ReportTable.Cell align="right">
                    <ReportTable.Badge tone="success">
                      {fmtNum(row.successfulCallbacks)}
                    </ReportTable.Badge>
                  </ReportTable.Cell>
                  <ReportTable.Cell align="right">
                    <ReportTable.Badge tone="warning">
                      {fmtNum(row.pendingCallbacks)}
                    </ReportTable.Badge>
                  </ReportTable.Cell>
                  <ReportTable.Cell align="right" numeric className="w-40">
                    <p
                      className="text-sm font-semibold"
                      style={{ color: rateColorVar(row.callbackRate) }}
                    >
                      {fmtPct(row.callbackRate)}
                    </p>
                    <Meter
                      className="mt-1.5"
                      value={row.callbackRate}
                      colorVar={rateColorVar(row.callbackRate)}
                    />
                  </ReportTable.Cell>
                  <ReportTable.Cell
                    align="right"
                    numeric
                    className="font-mono text-sm"
                  >
                    {fmt(row.averageCallbackTime)} {t('min')}
                  </ReportTable.Cell>
                </ReportTable.Row>
              ))}
            </ReportTable.Body>
          </ReportTable>
        )}
      </SectionCard>
    </div>
  );
}
