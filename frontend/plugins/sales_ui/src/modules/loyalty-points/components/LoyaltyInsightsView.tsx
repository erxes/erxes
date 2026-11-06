import { IconAlertTriangle } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useLoyaltyDrill } from '../drill';
import { TGroupLine, TLoyaltySummary, TRankedRow } from '../summary';
import {
  LoyaltyGroupTable,
  LoyaltyKpiTiles,
  LoyaltyPanel,
  LoyaltyRankedRows,
} from './LoyaltyInsightSections';

export type TRanking = {
  key: string;
  title: string;
  rows: TRankedRow[];
  renderName: (id: string) => ReactNode;
  // Which record field a row drills by.
  drillBy: 'recordId' | 'customerId' | 'personId' | 'branchId';
};

export type TLoyaltyInsightsProps = {
  loading: boolean;
  error?: Error;
  refetch: () => unknown;
  summary: TLoyaltySummary;
  // The records counted: deals, orders.
  records: { label: string; count: number };
  timeline: ReactNode;
  // Where the records belong: pipelines, POSes; shown when there are several.
  groups: { title: string; label: string; lines: TGroupLine[] };
  rankings: TRanking[];
};

/**
 * Totals, the timeline, a per-group table and rankings over the records a
 * page's filters match: How much, when, where, who.
 */
export const LoyaltyInsightsView = ({
  loading,
  error,
  refetch,
  summary,
  records,
  timeline,
  groups,
  rankings,
}: TLoyaltyInsightsProps) => {
  const { t } = useTranslation('sales');
  const drill = useLoyaltyDrill();
  const all = () => drill?.open({ label: t('loyalty-drill-all', 'All') });

  if (error) {
    return (
      <div className="m-3 flex items-center gap-2 rounded-lg border px-3 py-2 text-sm text-destructive">
        <IconAlertTriangle className="size-4" />
        {t('loyalty-insights-error', 'Could not load the totals')}
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          {t('retry', 'Try again')}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-muted-foreground">
          {t(
            'loyalty-drill-hint',
            'Click a figure to see the movements behind it',
          )}
        </span>
        <Button variant="outline" size="sm" onClick={all}>
          {t('loyalty-drill-all-movements', 'All movements')}
        </Button>
      </div>
      <LoyaltyKpiTiles summary={summary} records={records} loading={loading} />
      {timeline}
      {groups.lines.length > 1 && (
        <LoyaltyPanel title={groups.title}>
          <LoyaltyGroupTable label={groups.label} lines={groups.lines} />
        </LoyaltyPanel>
      )}
      {/* Each card is as tall as its own list; empty ones are left out. */}
      <div className="grid items-start gap-3 md:grid-cols-2 xl:grid-cols-3">
        {rankings
          .filter(({ rows }) => rows.length > 0)
          .map(({ key, drillBy, title, rows, renderName }) => (
            <LoyaltyPanel key={key} title={title}>
              <LoyaltyRankedRows
                rows={rows}
                renderName={renderName}
                onSelect={(id) =>
                  drill?.open({ [drillBy]: id, label: renderName(id) })
                }
              />
            </LoyaltyPanel>
          ))}
      </div>
    </div>
  );
};
