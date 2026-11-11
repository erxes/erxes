import { cn, Skeleton, Table } from 'erxes-ui';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { TLoyaltyDrill, useLoyaltyDrill } from '../drill';
import { TGroupLine, TLoyaltySummary } from '../summary';

// The insights page and the home dashboard widgets draw the same sections;
// a section drills only where a drill provider is around it.

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

export const LoyaltyPanel = ({
  title,
  className,
  children,
}: {
  title: string;
  className?: string;
  children: ReactNode;
}) => (
  <div
    className={cn(
      'flex min-w-0 flex-col gap-2 rounded-lg border bg-background p-3',
      className,
    )}
  >
    <span className="text-xs font-medium text-muted-foreground">{title}</span>
    {children}
  </div>
);

/** Opens a drill when the section sits under a drill provider. */
const useDrillOpener = () => {
  const drill = useLoyaltyDrill();

  return drill ? (next: TLoyaltyDrill) => drill.open(next) : undefined;
};

const DrillLine = ({
  onClick,
  children,
}: {
  onClick?: () => void;
  children: ReactNode;
}) => (
  <span
    className={cn(
      'w-fit text-xs text-muted-foreground',
      onClick && 'cursor-pointer hover:text-foreground hover:underline',
    )}
    role={onClick ? 'button' : undefined}
    tabIndex={onClick ? 0 : undefined}
    onClick={onClick}
  >
    {children}
  </span>
);

/** Earned, spent, refunded, net, rates and counts, with the side lines. */
export const LoyaltyKpiTiles = ({
  summary,
  records,
  loading,
  gridClassName = 'grid-cols-2 sm:grid-cols-4 xl:grid-cols-8',
}: {
  summary: TLoyaltySummary;
  // The records counted: deals, orders.
  records: { label: string; count: number };
  loading: boolean;
  gridClassName?: string;
}) => {
  const { t } = useTranslation('sales');
  const open = useDrillOpener();
  const { kinds, net, customerCount, recalculated, spendRate, refundRate } =
    summary;
  const all = open && (() => open({ label: t('loyalty-drill-all', 'All') }));
  const ofKind = (kind: TLoyaltyDrill['kind'], label: string) =>
    open && (() => open({ kind, label }));

  return (
    <>
      <div className={cn('grid gap-2', gridClassName)}>
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
        <DrillLine
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
        </DrillLine>
      )}
      {kinds.other !== 0 && !loading && (
        <DrillLine
          onClick={ofKind(
            'other',
            t('loyalty-drill-other', 'Expired and reset'),
          )}
        >
          {t('loyalty-insight-other', 'Expired and reset: {{value}}', {
            value: kinds.other.toLocaleString(),
          })}
        </DrillLine>
      )}
    </>
  );
};

const Amount = ({ value, suffix }: { value: number; suffix?: string }) => (
  <Table.Cell className="text-right tabular-nums">
    {value.toLocaleString()}
    {suffix}
  </Table.Cell>
);

/** Earned, spent, refunded, recalculated, net and refund rate per group. */
export const LoyaltyGroupTable = ({
  label,
  lines,
}: {
  // What a group is: pipeline, POS.
  label: string;
  lines: TGroupLine[];
}) => {
  const { t } = useTranslation('sales');
  const open = useDrillOpener();

  return (
    <Table>
      <Table.Header>
        <Table.Row>
          <Table.Head>{label}</Table.Head>
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
        {lines.map((line) => (
          <Table.Row
            key={line.id || line.name}
            className={cn(open && line.id && 'cursor-pointer')}
            onClick={() =>
              open && line.id && open({ groupId: line.id, label: line.name })
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
  );
};

/**
 * Names come from their own modules; the bar shows the share of the leader.
 * A row opens its record when the list can.
 */
export const LoyaltyRankedRows = ({
  rows,
  renderName,
  onSelect,
}: {
  rows: { id: string; value: number }[];
  renderName: (id: string) => ReactNode;
  onSelect?: (id: string) => void;
}) => {
  const top = rows[0]?.value || 1;

  return (
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
  );
};
