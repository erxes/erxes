import { cn } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useTopNumbers } from '../../hooks/useTopNumbers';
import { SectionCard } from '../SectionCard';
import { Meter } from '../Meter';
import { ReportTable } from '../ReportTable';
import { CARRIER_COLOR_VAR, fmtDur, fmtNum } from '../../utils';

export function TopNumbersSection() {
  const { t } = useTranslation('frontline');
  const { numbers, loading } = useTopNumbers(20);

  const busiest = Math.max(...numbers.map(({ attempts }) => attempts), 1);

  return (
    <SectionCard
      title={t('top-contact-numbers')}
      description={t('highest-volume-phone-numbers')}
      accentClass="bg-[var(--chart-5)]"
      loading={loading}
      skeletonHeight="h-48"
    >
      {!numbers.length ? (
        <ReportTable.Empty>{t('no-top-number-data')}</ReportTable.Empty>
      ) : (
        <ReportTable>
          <ReportTable.Header>
            <ReportTable.HeaderRow>
              <ReportTable.Head align="center" className="w-14 px-2">
                #
              </ReportTable.Head>
              <ReportTable.Head>{t('number')}</ReportTable.Head>
              <ReportTable.Head>{t('carrier')}</ReportTable.Head>
              <ReportTable.Head align="right" className="w-36">
                {t('attempts')}
              </ReportTable.Head>
              <ReportTable.Head align="right">{t('answered')}</ReportTable.Head>
              <ReportTable.Head align="right">{t('missed')}</ReportTable.Head>
              <ReportTable.Head align="right">
                {t('total-talk')}
              </ReportTable.Head>
            </ReportTable.HeaderRow>
          </ReportTable.Header>
          <ReportTable.Body>
            {numbers.map((row, i) => {
              const carrierColor = CARRIER_COLOR_VAR[row.carrier];
              const isPodium = i < 3;

              return (
                <ReportTable.Row key={`${row.number}-${i}`} index={i}>
                  <ReportTable.Cell align="center" className="w-14 px-2">
                    <span
                      className={cn(
                        'inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold tabular-nums',
                        isPodium
                          ? 'bg-(--chart-5)/15 text-(--chart-5)'
                          : 'text-muted-foreground',
                      )}
                    >
                      {i + 1}
                    </span>
                  </ReportTable.Cell>

                  <ReportTable.Cell className="font-mono text-sm font-medium">
                    {row.number || '—'}
                  </ReportTable.Cell>

                  <ReportTable.Cell>
                    <span
                      className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold text-primary-foreground"
                      style={{
                        background: carrierColor ?? 'var(--muted-foreground)',
                      }}
                    >
                      {row.carrier}
                    </span>
                  </ReportTable.Cell>

                  <ReportTable.Cell align="right" numeric className="w-36">
                    <p className="text-sm font-semibold">
                      {fmtNum(row.attempts)}
                    </p>
                    <Meter
                      className="mt-1.5"
                      value={(row.attempts / busiest) * 100}
                      colorVar="var(--chart-5)"
                    />
                  </ReportTable.Cell>

                  <ReportTable.Cell align="right">
                    <ReportTable.Badge tone="success">
                      {fmtNum(row.answered)}
                    </ReportTable.Badge>
                  </ReportTable.Cell>

                  <ReportTable.Cell align="right">
                    <ReportTable.Badge tone="destructive">
                      {fmtNum(row.missed)}
                    </ReportTable.Badge>
                  </ReportTable.Cell>

                  <ReportTable.Cell
                    align="right"
                    numeric
                    className="font-mono text-sm"
                  >
                    {fmtDur(row.duration)}
                  </ReportTable.Cell>
                </ReportTable.Row>
              );
            })}
          </ReportTable.Body>
        </ReportTable>
      )}
    </SectionCard>
  );
}
