import { Table } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useTopNumbers } from '../../hooks/useTopNumbers';
import { SectionCard } from '../SectionCard';
import { CARRIER_COLOR_VAR, fmtDur, fmtNum } from '../../utils';

/** Top Contact Numbers tab: ranked table of most active phone numbers. */
export function TopNumbersSection() {
  const { t } = useTranslation('frontline');
  const { numbers, loading } = useTopNumbers(20);

  return (
    <SectionCard
      title={t('top-contact-numbers')}
      description={t('highest-volume-phone-numbers')}
      accentClass="bg-[var(--chart-5)]"
      loading={loading}
      skeletonHeight="h-48"
    >
      {!numbers.length ? (
        <div className="rounded-xl border-2 border-dashed p-8 text-center text-sm text-muted-foreground">
          {t('no-top-number-data')}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border">
          <Table>
            <Table.Header>
              <Table.Row className="bg-muted/50">
                <Table.Head className="font-semibold">#</Table.Head>
                <Table.Head className="font-semibold">{t('number')}</Table.Head>
                <Table.Head className="font-semibold">{t('carrier')}</Table.Head>
                <Table.Head className="font-semibold text-right">
                  {t('attempts')}
                </Table.Head>
                <Table.Head className="font-semibold text-right">
                  {t('answered')}
                </Table.Head>
                <Table.Head className="font-semibold text-right">
                  {t('missed')}
                </Table.Head>
                <Table.Head className="font-semibold text-right">
                  {t('total-talk')}
                </Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {numbers.map((row, i) => {
                const carrierColor = CARRIER_COLOR_VAR[row.carrier];
                return (
                  <Table.Row
                    key={`${row.number}-${i}`}
                    className="hover:bg-muted/30"
                  >
                    <Table.Cell className="text-xs text-muted-foreground tabular-nums">
                      {i + 1}
                    </Table.Cell>
                    <Table.Cell className="font-mono text-sm">
                      {row.number || '—'}
                    </Table.Cell>
                    <Table.Cell>
                      <span
                        className="rounded-md px-1.5 py-0.5 text-xs font-semibold text-white"
                        style={{
                          background: carrierColor ?? 'var(--muted-foreground)',
                        }}
                      >
                        {row.carrier}
                      </span>
                    </Table.Cell>
                    <Table.Cell className="text-right font-semibold">
                      {fmtNum(row.attempts)}
                    </Table.Cell>
                    <Table.Cell className="text-right">
                      <span className="inline-flex items-center rounded-md bg-(--pos)/10 px-2 py-0.5 text-xs font-medium text-(--pos)">
                        {fmtNum(row.answered)}
                      </span>
                    </Table.Cell>
                    <Table.Cell className="text-right">
                      <span className="inline-flex items-center rounded-md bg-(--neg)/10 px-2 py-0.5 text-xs font-medium text-(--neg)">
                        {fmtNum(row.missed)}
                      </span>
                    </Table.Cell>
                    <Table.Cell className="text-right font-mono text-sm">
                      {fmtDur(row.duration)}
                    </Table.Cell>
                  </Table.Row>
                );
              })}
            </Table.Body>
          </Table>
        </div>
      )}
    </SectionCard>
  );
}
