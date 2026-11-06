import { IconAlertTriangle } from '@tabler/icons-react';
import { Button, cn, Skeleton, Table } from 'erxes-ui';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { TLoyaltyDrill, useLoyaltyDrill } from '../drill';
import { TGroupLine, TLoyaltySummary, TRankedRow } from '../summary';

// A figure; one that opens its entries reads as a button.
const Tile = ({
  label,
  value,
  suffix,
  tone,
  loading,
  onClick,
}: {
  label: string;
  value: number;
  suffix?: string;
  tone?: 'positive' | 'negative';
  loading: boolean;
  onClick?: () => void;
}) => (
  <div
    className={cn(
      'flex min-w-0 flex-col gap-1 rounded-lg border bg-background px-3 py-2',
      onClick &&
        'cursor-pointer transition-colors hover:border-primary/40 hover:bg-accent',
    )}
    role={onClick ? 'button' : undefined}
    tabIndex={onClick ? 0 : undefined}
    onClick={onClick}
    onKeyDown={(event) => onClick && event.key === 'Enter' && onClick()}
  >
    <span className="truncate text-xs text-muted-foreground">{label}</span>
    {loading ? (
      <Skeleton className="h-6 w-20" />
    ) : (
      <span
        className={cn(
          'text-lg font-semibold tabular-nums',
          tone === 'positive' && 'text-success',
          tone === 'negative' && 'text-destructive',
        )}
      >
        {value.toLocaleString()}
        {suffix}
      </span>
    )}
  </div>
);

const Panel = ({ title, children }: { title: string; children: ReactNode }) => (
  <div className="flex min-w-0 flex-col gap-2 rounded-lg border bg-background p-3">
    <span className="text-xs font-medium text-muted-foreground">{title}</span>
    {children}
  </div>
);

// Names come from their own modules; the bar shows the share of the leader.
// A row opens its record when the list can.
const RankedList = ({
  title,
  rows,
  renderName,
  onSelect,
}: {
  title: string;
  rows: { id: string; value: number }[];
  renderName: (id: string) => ReactNode;
  onSelect?: (id: string) => void;
}) => {
  const top = rows[0]?.value || 1;

  return (
    <Panel title={title}>
      <div className="flex flex-col gap-2">
        {rows.map(({ id, value }) => (
          <div
            key={id}
            className={cn(
              'flex flex-col gap-1 rounded',
              onSelect && 'cursor-pointer hover:bg-accent',
            )}
            onClick={onSelect && (() => onSelect(id))}
          >
            <div className="flex items-center justify-between gap-2 text-sm">
              <span className="min-w-0 overflow-hidden">{renderName(id)}</span>
              <span className="shrink-0 tabular-nums">
                {value.toLocaleString()}
              </span>
            </div>
            <div className="h-1 rounded-full bg-muted">
              <div
                className="h-1 rounded-full bg-primary"
                style={{ width: `${(value / top) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
};

const Amount = ({ value, suffix }: { value: number; suffix?: string }) => (
  <Table.Cell className="text-right tabular-nums">
    {value.toLocaleString()}
    {suffix}
  </Table.Cell>
);

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
  const { kinds, net, customerCount, recalculated, spendRate, refundRate } =
    summary;
  const open = (next: TLoyaltyDrill) => drill?.open(next);
  const all = () => open({ label: t('loyalty-drill-all', 'All') });
  const ofKind = (kind: TLoyaltyDrill['kind'], label: string) => () =>
    open({ kind, label });

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
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-8">
        <Tile
          label={t('loyalty-insight-earned', 'Earned')}
          value={kinds.earned}
          onClick={ofKind('earned', t('loyalty-insight-earned', 'Earned'))}
          tone="positive"
          loading={loading}
        />
        <Tile
          label={t('loyalty-insight-spent', 'Spent')}
          value={kinds.spent}
          onClick={ofKind('spent', t('loyalty-insight-spent', 'Spent'))}
          tone="negative"
          loading={loading}
        />
        <Tile
          label={t('loyalty-insight-refunded', 'Refunded')}
          value={kinds.refunded}
          onClick={ofKind(
            'refunded',
            t('loyalty-insight-refunded', 'Refunded'),
          )}
          tone="negative"
          loading={loading}
        />
        <Tile
          label={t('loyalty-insight-net', 'Net')}
          value={net}
          loading={loading}
          onClick={all}
        />
        <Tile
          label={t('loyalty-insight-spend-rate', 'Spend rate')}
          value={spendRate}
          suffix="%"
          loading={loading}
        />
        <Tile
          label={t('loyalty-insight-refund-rate', 'Refund rate')}
          value={refundRate}
          suffix="%"
          loading={loading}
        />
        <Tile label={records.label} value={records.count} loading={loading} />
        <Tile
          label={t('loyalty-insight-customers', 'Customers')}
          value={customerCount}
          loading={loading}
        />
      </div>
      {recalculated !== 0 && !loading && (
        <span
          className="w-fit cursor-pointer text-xs text-muted-foreground hover:text-foreground hover:underline"
          role="button"
          tabIndex={0}
          onClick={ofKind(
            'recalculated',
            t('loyalty-insight-recalculated', 'Recalculated'),
          )}
        >
          {t(
            'loyalty-insight-recalculated-line',
            'Recalculated purchases changed the points by {{value}}',
            { value: recalculated.toLocaleString() },
          )}
        </span>
      )}
      {kinds.other !== 0 && !loading && (
        <span
          className="w-fit cursor-pointer text-xs text-muted-foreground hover:text-foreground hover:underline"
          role="button"
          tabIndex={0}
          onClick={ofKind(
            'other',
            t('loyalty-drill-other', 'Expired and reset'),
          )}
        >
          {t('loyalty-insight-other', 'Expired and reset: {{value}}', {
            value: kinds.other.toLocaleString(),
          })}
        </span>
      )}
      {timeline}
      {groups.lines.length > 1 && (
        <Panel title={groups.title}>
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.Head>{groups.label}</Table.Head>
                <Table.Head className="text-right">
                  {t('loyalty-insight-earned', 'Earned')}
                </Table.Head>
                <Table.Head className="text-right">
                  {t('loyalty-insight-spent', 'Spent')}
                </Table.Head>
                <Table.Head className="text-right">
                  {t('loyalty-insight-refunded', 'Refunded')}
                </Table.Head>
                <Table.Head className="text-right">
                  {t('loyalty-insight-recalculated', 'Recalculated')}
                </Table.Head>
                <Table.Head className="text-right">
                  {t('loyalty-insight-net', 'Net')}
                </Table.Head>
                <Table.Head className="text-right">
                  {t('loyalty-insight-refund-rate', 'Refund rate')}
                </Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {groups.lines.map((line) => (
                <Table.Row
                  key={line.id || line.name}
                  className={cn(line.id && 'cursor-pointer')}
                  onClick={() =>
                    line.id && open({ groupId: line.id, label: line.name })
                  }
                >
                  <Table.Cell>
                    <span className="text-muted-foreground">
                      {line.parent ? `${line.parent} / ` : ''}
                    </span>
                    {line.name}
                  </Table.Cell>
                  <Amount value={line.earned} />
                  <Amount value={line.spent} />
                  <Amount value={line.refunded} />
                  <Amount value={line.recalculated} />
                  <Amount value={line.net} />
                  <Amount value={line.refundRate} suffix="%" />
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </Panel>
      )}
      {/* Each card is as tall as its own list; empty ones are left out. */}
      <div className="grid items-start gap-3 md:grid-cols-2 xl:grid-cols-3">
        {rankings
          .filter(({ rows }) => rows.length > 0)
          .map(({ key, drillBy, ...ranking }) => (
            <RankedList
              key={key}
              {...ranking}
              onSelect={(id) =>
                open({ [drillBy]: id, label: ranking.renderName(id) })
              }
            />
          ))}
      </div>
    </div>
  );
};
