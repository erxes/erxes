import { Table } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useCallbackStats } from '../../hooks/useCallbackStats';
import { CallbackMiniKpi } from './CallbackMiniKpi';
import { SectionCard } from '../SectionCard';
import { fmt, fmtNum, fmtPct } from '../../utils';

/** Callbacks tab: per-queue callback recovery stats. */
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
      {/* Mini KPI row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <CallbackMiniKpi
          label={t('missed-calls')}
          value={fmtNum(totals.missed)}
          accentVar="var(--neg)"
        />
        <CallbackMiniKpi label={t('cb-attempts')} value={fmtNum(totals.attempts)} />
        <CallbackMiniKpi
          label={t('successful')}
          value={fmtNum(totals.successful)}
          accentVar="var(--pos)"
        />
        <CallbackMiniKpi
          label={t('recovery-rate')}
          value={fmtPct(overallRate)}
          accentVar={overallRate >= 60 ? 'var(--pos)' : 'var(--warn)'}
        />
      </div>

      {/* Detail table */}
      <SectionCard
        title={t('callback-recovery')}
        description={t('per-queue-missed-call-follow-up')}
        accentClass="bg-[var(--warn)]"
        loading={loading}
        skeletonHeight="h-32"
      >
        {!stats.length ? (
          <div className="rounded-xl border-2 border-dashed p-8 text-center text-sm text-muted-foreground">
            {t('no-callback-data')}
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border">
            <Table>
              <Table.Header>
                <Table.Row className="bg-muted/50">
                  <Table.Head className="font-semibold">{t('queue')}</Table.Head>
                  <Table.Head className="font-semibold text-right">
                    {t('missed')}
                  </Table.Head>
                  <Table.Head className="font-semibold text-right">
                    {t('cb-attempts')}
                  </Table.Head>
                  <Table.Head className="font-semibold text-right">
                    {t('successful')}
                  </Table.Head>
                  <Table.Head className="font-semibold text-right">
                    {t('pending')}
                  </Table.Head>
                  <Table.Head className="font-semibold text-right">
                    {t('cb-rate')}
                  </Table.Head>
                  <Table.Head className="font-semibold text-right">
                    {t('avg-cb-time')}
                  </Table.Head>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {stats.map((row, i) => (
                  <Table.Row
                    key={`${row.queue}-${i}`}
                    className="hover:bg-muted/30"
                  >
                    <Table.Cell className="font-medium">
                      {row.queue || '—'}
                    </Table.Cell>
                    <Table.Cell className="text-right font-semibold">
                      {fmtNum(row.totalMissedCalls)}
                    </Table.Cell>
                    <Table.Cell className="text-right">
                      {fmtNum(row.callbackAttempts)}
                    </Table.Cell>
                    <Table.Cell className="text-right">
                      <span className="inline-flex items-center rounded-md bg-(--pos)/10 px-2 py-0.5 text-xs font-medium text-(--pos)">
                        {fmtNum(row.successfulCallbacks)}
                      </span>
                    </Table.Cell>
                    <Table.Cell className="text-right">
                      <span className="inline-flex items-center rounded-md bg-(--warn)/10 px-2 py-0.5 text-xs font-medium text-(--warn)">
                        {fmtNum(row.pendingCallbacks)}
                      </span>
                    </Table.Cell>
                    <Table.Cell className="text-right font-medium">
                      {fmtPct(row.callbackRate)}
                    </Table.Cell>
                    <Table.Cell className="text-right font-mono text-sm">
                      {fmt(row.averageCallbackTime)} {t('min')}
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </div>
        )}
      </SectionCard>
    </div>
  );
}
