import { useEffect, useMemo, useState } from 'react';
import { gql, useQuery } from '@apollo/client';
import {
  Button,
  ChartContainer,
  ChartTooltipContent,
  Dialog,
  ScrollArea,
  Select,
  Spinner,
  Table,
  cn,
} from 'erxes-ui';
import { endOfDay, format, startOfMonth } from 'date-fns';
import {
  IconPhone,
  IconPhoneCheck,
  IconPhoneOff,
  IconPercentage,
  IconClock,
  IconShieldCheck,
  IconTrendingUp,
  IconTrendingDown,
  IconUsers,
  IconRepeat,
} from '@tabler/icons-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from 'recharts';
import { CALL_QUEUE_LIST } from '@/integrations/call/graphql/queries/callQueueList';
import { useCallUserIntegration } from '@/integrations/call/hooks/useCallUserIntegration';
import {
  callReportsDashboard,
  CALL_KPI_SCORECARD,
  CALL_VOLUME_SERIES,
  CALL_CARRIER_BREAKDOWN,
  CALL_HEATMAP,
  CALL_TOP_NUMBERS,
  CALL_CALLBACK_STATS,
} from '@/integrations/call/graphql/queries/callStatistics';
import { formatSeconds } from '@/integrations/call/utils/callUtils';
import { ReportDateFilter } from '@/report/components/filter-popover/ReportDateFilter';
import { getDateRange } from '@/report/utils/dateFilters';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmt = (n: number | null | undefined, decimals = 1) =>
  (n ?? 0).toFixed(decimals);
const fmtPct = (n: number | null | undefined) => `${fmt(n)}%`;
const fmtDur = (n: number | null | undefined) =>
  formatSeconds(Math.round(n ?? 0));
const fmtNum = (n: number | null | undefined) =>
  (n ?? 0).toLocaleString();

const CARRIER_COLORS = [
  'var(--chart-1, #6366f1)',
  'var(--chart-2, #22d3ee)',
  'var(--chart-3, #f59e0b)',
  'var(--chart-4, #ec4899)',
  'var(--chart-5, #10b981)',
];

const DOW_LABELS = ['', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// ─── Types ───────────────────────────────────────────────────────────────────

type QueueRecord = { _id?: string; name?: string; queue?: string };
type QueueOption = { label: string; value: string };

type KpiData = {
  callstotal: number;
  serviceLevel: number;
  abandonment: number;
  averageSpeed: number;
  averageAnsweredTime: number;
  firstCallResolution: number | null;
  occupancy: number | null;
};

type VolumePoint = { day: string; incoming: number; outgoing: number; answered: number; abandoned: number };
type CarrierSlice = { name: string; value: number };
type HeatCell = { dow: number; hour: number; total: number; answered: number; answerRate: number };
type TopNumber = { number: string; carrier: string; attempts: number; answered: number; missed: number; duration: number };
type CallbackStat = {
  queue: string;
  totalMissedCalls: number;
  callbackAttempts: number;
  successfulCallbacks: number;
  callbackRate: number;
  pendingCallbacks: number;
  averageCallbackTime: number;
};
type QueueStat = {
  queue: string;
  totalCalls: number;
  answeredCalls: number;
  answeredRate: number;
  abandonedCalls: number;
  abandonedRate: number;
  averageWaitTime: number;
  averageTalkTime: number;
};
type AgentStat = {
  agent: string;
  agentName?: string;
  totalCalls: number;
  answeredCalls: number;
  answeredRate: number;
  missedCalls: number;
  missedRate: number;
  averageTalkTime: number;
  averageWaitTime: number;
  shortestCall: number;
  longestCall: number;
};

// ─── Normalise queue values (string or object) ────────────────────────────────

const normalizeQueue = (queue: string | QueueRecord): QueueOption | null => {
  if (typeof queue === 'string') return { label: queue, value: queue };
  const value = queue.name || queue._id || queue.queue;
  if (!value) return null;
  return { label: queue.name || String(value), value: String(value) };
};

// ─── KPI Card ─────────────────────────────────────────────────────────────────

const KPI_CONFIG: Record<
  string,
  { icon: React.ElementType; accentClass: string; iconBgClass: string }
> = {
  'Total Calls': { icon: IconPhone, accentClass: 'text-blue-600', iconBgClass: 'bg-blue-100 text-blue-600' },
  'Service Level': { icon: IconShieldCheck, accentClass: 'text-violet-600', iconBgClass: 'bg-violet-100 text-violet-600' },
  'Abandonment': { icon: IconPhoneOff, accentClass: 'text-rose-600', iconBgClass: 'bg-rose-100 text-rose-600' },
  'Avg Speed of Answer': { icon: IconClock, accentClass: 'text-amber-600', iconBgClass: 'bg-amber-100 text-amber-600' },
  'Avg Handle Time': { icon: IconPhoneCheck, accentClass: 'text-emerald-600', iconBgClass: 'bg-emerald-100 text-emerald-600' },
  'Answer Rate': { icon: IconPercentage, accentClass: 'text-cyan-600', iconBgClass: 'bg-cyan-100 text-cyan-600' },
};

const KpiCard = ({
  title,
  value,
  subtitle,
  trend,
}: {
  title: string;
  value: string;
  subtitle: string;
  trend?: 'up' | 'down' | null;
}) => {
  const cfg = KPI_CONFIG[title] ?? { icon: IconPhone, accentClass: 'text-foreground', iconBgClass: 'bg-muted text-muted-foreground' };
  const Icon = cfg.icon;
  return (
    <div className="relative rounded-xl border bg-background p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="space-y-1.5 min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground truncate">{title}</p>
          <p className={`text-3xl font-bold tracking-tight ${cfg.accentClass}`}>{value}</p>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
        <div className={`ml-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${cfg.iconBgClass}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      {trend && (
        <div className={`mt-2 flex items-center gap-1 text-xs font-medium ${trend === 'up' ? 'text-emerald-600' : 'text-rose-600'}`}>
          {trend === 'up' ? <IconTrendingUp className="h-3.5 w-3.5" /> : <IconTrendingDown className="h-3.5 w-3.5" />}
        </div>
      )}
    </div>
  );
};

// ─── Section heading ──────────────────────────────────────────────────────────

const SectionTitle = ({ children, color = 'bg-blue-500' }: { children: React.ReactNode; color?: string }) => (
  <div className="flex items-center gap-2">
    <div className={`h-5 w-1 rounded-full ${color}`} />
    <h3 className="text-base font-semibold">{children}</h3>
  </div>
);

// ─── Volume Chart ─────────────────────────────────────────────────────────────

const VolumeChart = ({ data }: { data: VolumePoint[] }) => {
  const chartData = useMemo(
    () =>
      data.map((d) => ({
        ...d,
        day: format(new Date(d.day), 'MMM dd'),
      })),
    [data],
  );

  const chartConfig = useMemo(
    () => ({
      incoming: { label: 'Inbound', color: 'var(--chart-2, #6366f1)' },
      outgoing: { label: 'Outbound', color: 'var(--chart-3, #22d3ee)' },
      answered: { label: 'Answered', color: 'var(--chart-4, #10b981)' },
    }),
    [],
  );

  if (!data.length) {
    return <div className="flex h-56 items-center justify-center text-sm text-muted-foreground">No data for selected range</div>;
  }

  return (
    <ChartContainer config={chartConfig} className="h-64 w-full">
      <AreaChart data={chartData} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="incomingGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--chart-2, #6366f1)" stopOpacity={0.25} />
            <stop offset="95%" stopColor="var(--chart-2, #6366f1)" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="outgoingGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--chart-3, #22d3ee)" stopOpacity={0.25} />
            <stop offset="95%" stopColor="var(--chart-3, #22d3ee)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
        <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} width={32} />
        <Tooltip content={<ChartTooltipContent />} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Area type="monotone" dataKey="incoming" name="Inbound" stroke="var(--chart-2, #6366f1)" fill="url(#incomingGrad)" strokeWidth={2} dot={false} />
        <Area type="monotone" dataKey="outgoing" name="Outbound" stroke="var(--chart-3, #22d3ee)" fill="url(#outgoingGrad)" strokeWidth={2} dot={false} />
        <Area type="monotone" dataKey="answered" name="Answered" stroke="var(--chart-4, #10b981)" fill="none" strokeWidth={1.5} strokeDasharray="4 2" dot={false} />
      </AreaChart>
    </ChartContainer>
  );
};

// ─── Carrier Donut ────────────────────────────────────────────────────────────

const CarrierDonut = ({ data }: { data: CarrierSlice[] }) => {
  const total = data.reduce((s, d) => s + d.value, 0);

  if (!data.length) {
    return <div className="flex h-56 items-center justify-center text-sm text-muted-foreground">No data</div>;
  }

  return (
    <div className="flex items-center gap-4">
      <ResponsiveContainer width={160} height={160}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} innerRadius={44}>
            {data.map((_, i) => (
              <Cell key={i} fill={CARRIER_COLORS[i % CARRIER_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number, name: string) => [`${value} (${((value / total) * 100).toFixed(1)}%)`, name]} />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex flex-col gap-1.5 min-w-0 flex-1">
        {data.map((d, i) => (
          <div key={d.name} className="flex items-center gap-2 text-xs">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: CARRIER_COLORS[i % CARRIER_COLORS.length] }} />
            <span className="flex-1 truncate text-muted-foreground">{d.name}</span>
            <span className="font-semibold tabular-nums">{fmtPct((d.value / total) * 100)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Heatmap ──────────────────────────────────────────────────────────────────

const Heatmap = ({ data }: { data: HeatCell[] }) => {
  if (!data.length) {
    return <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">No data</div>;
  }

  // Build lookup map
  const maxTotal = Math.max(...data.map((d) => d.total), 1);
  const cellMap = new Map(data.map((d) => [`${d.dow}:${d.hour}`, d]));

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const dows = [1, 2, 3, 4, 5, 6, 7]; // Mon..Sun

  return (
    <div className="overflow-x-auto">
      <div style={{ minWidth: 640 }}>
        {/* Hour header */}
        <div className="flex">
          <div className="w-10 shrink-0" />
          {hours.map((h) => (
            <div key={h} className="flex-1 text-center text-[9px] text-muted-foreground">
              {h % 3 === 0 ? `${String(h).padStart(2, '0')}h` : ''}
            </div>
          ))}
        </div>
        {dows.map((dow) => (
          <div key={dow} className="flex items-center">
            <div className="w-10 shrink-0 text-[10px] text-muted-foreground text-right pr-1.5">
              {DOW_LABELS[dow]}
            </div>
            {hours.map((hour) => {
              const cell = cellMap.get(`${dow}:${hour}`);
              const intensity = cell ? cell.total / maxTotal : 0;
              return (
                <div
                  key={hour}
                  title={cell ? `${DOW_LABELS[dow]} ${hour}:00 — ${cell.total} calls, ${fmtPct(cell.answerRate)} answered` : 'No data'}
                  className="flex-1 m-[1px] rounded-sm aspect-square"
                  style={{
                    background: intensity > 0
                      ? `oklch(${0.55 + 0.3 * (1 - intensity)} ${0.18 * intensity} 260)`
                      : 'var(--muted)',
                  }}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Top Numbers Table ────────────────────────────────────────────────────────

const TopNumbersTable = ({ data }: { data: TopNumber[] }) => {
  if (!data.length) {
    return (
      <div className="rounded-xl border-2 border-dashed p-8 text-center text-sm text-muted-foreground">
        No top number data
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border shadow-sm">
      <Table>
        <Table.Header>
          <Table.Row className="bg-muted/50">
            <Table.Head className="font-semibold">Number</Table.Head>
            <Table.Head className="font-semibold">Carrier</Table.Head>
            <Table.Head className="font-semibold text-right">Attempts</Table.Head>
            <Table.Head className="font-semibold text-right">Answered</Table.Head>
            <Table.Head className="font-semibold text-right">Missed</Table.Head>
            <Table.Head className="font-semibold text-right">Total Talk</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {data.map((row, i) => (
            <Table.Row key={`${row.number}-${i}`} className="hover:bg-muted/30">
              <Table.Cell className="font-mono text-sm">{row.number || '—'}</Table.Cell>
              <Table.Cell>
                <span className="rounded-md bg-muted px-1.5 py-0.5 text-xs font-medium">{row.carrier}</span>
              </Table.Cell>
              <Table.Cell className="text-right font-semibold">{fmtNum(row.attempts)}</Table.Cell>
              <Table.Cell className="text-right">
                <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-sm font-medium text-emerald-700">
                  {fmtNum(row.answered)}
                </span>
              </Table.Cell>
              <Table.Cell className="text-right">
                <span className="inline-flex items-center rounded-md bg-rose-50 px-2 py-0.5 text-sm font-medium text-rose-700">
                  {fmtNum(row.missed)}
                </span>
              </Table.Cell>
              <Table.Cell className="text-right font-mono text-sm">{fmtDur(row.duration)}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </div>
  );
};

// ─── Callback Stats ───────────────────────────────────────────────────────────

const CallbackStatsSection = ({ data }: { data: CallbackStat[] }) => {
  if (!data.length) {
    return (
      <div className="rounded-xl border-2 border-dashed p-8 text-center text-sm text-muted-foreground">
        No callback data for the selected period
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border shadow-sm">
      <Table>
        <Table.Header>
          <Table.Row className="bg-muted/50">
            <Table.Head className="font-semibold">Queue</Table.Head>
            <Table.Head className="font-semibold text-right">Missed</Table.Head>
            <Table.Head className="font-semibold text-right">CB Attempts</Table.Head>
            <Table.Head className="font-semibold text-right">Successful</Table.Head>
            <Table.Head className="font-semibold text-right">Pending</Table.Head>
            <Table.Head className="font-semibold text-right">CB Rate</Table.Head>
            <Table.Head className="font-semibold text-right">Avg CB Time</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {data.map((row, i) => (
            <Table.Row key={`${row.queue}-${i}`} className="hover:bg-muted/30">
              <Table.Cell className="font-medium">{row.queue || '—'}</Table.Cell>
              <Table.Cell className="text-right font-semibold">{fmtNum(row.totalMissedCalls)}</Table.Cell>
              <Table.Cell className="text-right">{fmtNum(row.callbackAttempts)}</Table.Cell>
              <Table.Cell className="text-right">
                <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-sm font-medium text-emerald-700">
                  {fmtNum(row.successfulCallbacks)}
                </span>
              </Table.Cell>
              <Table.Cell className="text-right">
                <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-0.5 text-sm font-medium text-amber-700">
                  {fmtNum(row.pendingCallbacks)}
                </span>
              </Table.Cell>
              <Table.Cell className="text-right font-medium">{fmtPct(row.callbackRate)}</Table.Cell>
              <Table.Cell className="text-right font-mono text-sm">{fmt(row.averageCallbackTime)} min</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </div>
  );
};

// ─── Filters ──────────────────────────────────────────────────────────────────

const DIRECTION_OPTIONS = [
  { label: 'All Directions', value: 'all' },
  { label: 'Inbound', value: 'Inbound' },
  { label: 'Outbound', value: 'Outbound' },
];

const formatPhoneStr = (phone: string) => {
  if (!phone) return '';
  if (phone.includes(',')) return phone.split(',').map((p) => p.trim()).join(', ');
  if (/^\d+$/.test(phone) && phone.length > 8 && phone.length % 8 === 0) {
    return phone.match(/.{1,8}/g)?.join(', ') || phone;
  }
  return phone;
};

// ─── Main Component ────────────────────────────────────────────────────────────

export const CallReportsView = () => {
  const [selectedIntegrationId, setSelectedIntegrationId] = useState('');
  const [selectedQueue, setSelectedQueue] = useState('');
  const [dateFilter, setDateFilter] = useState(format(new Date(), 'yyyy-MMM'));
  const [direction, setDirection] = useState('all');
  const [expandedAgent, setExpandedAgent] = useState<string | null>(null);

  const { callUserIntegrations: integrations = [], loading: integrationsLoading } = useCallUserIntegration();

  const uniqueIntegrations = useMemo(() => {
    const map = new Map<string, any>();
    for (const integration of integrations) {
      const formatted = formatPhoneStr(integration.phone);
      if (map.has(integration.inboxId)) {
        const existing = map.get(integration.inboxId);
        if (!existing.phone.includes(formatted)) existing.phone += `, ${formatted}`;
      } else {
        map.set(integration.inboxId, { ...integration, phone: formatted });
      }
    }
    return Array.from(map.values());
  }, [integrations]);

  const { startDate, endDate, dateRangeLabel } = useMemo(() => {
    const { fromDate, toDate } = getDateRange(dateFilter);
    const start = fromDate || startOfMonth(new Date());
    const end = toDate || endOfDay(new Date());
    return {
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      dateRangeLabel:
        format(start, 'MMM dd, yyyy') === format(end, 'MMM dd, yyyy')
          ? format(start, 'MMM dd, yyyy')
          : `${format(start, 'MMM dd, yyyy')} — ${format(end, 'MMM dd, yyyy')}`,
    };
  }, [dateFilter]);

  useEffect(() => {
    if (selectedIntegrationId || !uniqueIntegrations.length) return;
    setSelectedIntegrationId(uniqueIntegrations[0].inboxId);
  }, [uniqueIntegrations, selectedIntegrationId]);

  const { data: queuesData, loading: queuesLoading } = useQuery<{ callQueueList: Array<string | QueueRecord> }, { inboxId: string }>(
    CALL_QUEUE_LIST,
    { variables: { inboxId: selectedIntegrationId }, skip: !selectedIntegrationId },
  );

  const queueOptions = useMemo(
    () => (queuesData?.callQueueList || []).map(normalizeQueue).filter((q): q is QueueOption => Boolean(q)),
    [queuesData],
  );

  useEffect(() => {
    if (!queueOptions.length) return;
    if (!queueOptions.some(({ value }) => value === selectedQueue)) {
      setSelectedQueue(queueOptions[0].value);
    }
  }, [queueOptions, selectedQueue]);

  const hasQueue = Boolean(selectedQueue);
  const queryVars = {
    startDate,
    endDate,
    queueId: selectedQueue || undefined,
    direction: direction !== 'all' ? direction : undefined,
  };

  // All report queries, each independent so partial failures don't block others
  const { data: kpiData, loading: kpiLoading } = useQuery<{ callKpiScorecard: KpiData }>(
    gql(CALL_KPI_SCORECARD),
    { variables: queryVars, skip: !hasQueue },
  );

  const { data: volumeData, loading: volumeLoading } = useQuery<{ callVolumeSeries: VolumePoint[] }>(
    gql(CALL_VOLUME_SERIES),
    { variables: queryVars, skip: !hasQueue },
  );

  const { data: carrierData, loading: carrierLoading } = useQuery<{ callCarrierBreakdown: CarrierSlice[] }>(
    gql(CALL_CARRIER_BREAKDOWN),
    { variables: queryVars, skip: !hasQueue },
  );

  const { data: heatmapData, loading: heatmapLoading } = useQuery<{ callHeatmap: HeatCell[] }>(
    gql(CALL_HEATMAP),
    { variables: queryVars, skip: !hasQueue },
  );

  const { data: topNumData, loading: topNumLoading } = useQuery<{ callTopNumbers: TopNumber[] }>(
    gql(CALL_TOP_NUMBERS),
    { variables: { ...queryVars, limit: 12 }, skip: !hasQueue },
  );

  const { data: callbackData, loading: callbackLoading } = useQuery<{ getCallbackStats: CallbackStat[] }>(
    gql(CALL_CALLBACK_STATS),
    { variables: { startDate, endDate, queueId: selectedQueue || undefined }, skip: !hasQueue },
  );

  const { data: dashData, loading: dashLoading } = useQuery<
    { callGetQueueStats: QueueStat[]; callGetAgentStats: AgentStat[] },
    { startDate: string; endDate: string; queueId: string; direction?: string }
  >(gql(callReportsDashboard), {
    variables: { startDate, endDate, queueId: selectedQueue, direction: direction !== 'all' ? direction : undefined },
    skip: !hasQueue,
  });

  const kpi = kpiData?.callKpiScorecard;
  const volumeSeries = volumeData?.callVolumeSeries ?? [];
  const carrierBreakdown = carrierData?.callCarrierBreakdown ?? [];
  const heatmap = heatmapData?.callHeatmap ?? [];
  const topNumbers = topNumData?.callTopNumbers ?? [];
  const callbackStats = callbackData?.getCallbackStats ?? [];
  const queueStats = dashData?.callGetQueueStats ?? [];
  const agentStats = dashData?.callGetAgentStats ?? [];

  const selectedQueueLabel = useMemo(
    () => queueOptions.find(({ value }) => value === selectedQueue)?.label ?? selectedQueue,
    [queueOptions, selectedQueue],
  );

  const kpiCards = [
    { title: 'Total Calls', value: fmtNum(kpi?.callstotal), subtitle: `${dateRangeLabel}` },
    { title: 'Service Level', value: fmtPct(kpi?.serviceLevel), subtitle: '≤20s answer target' },
    { title: 'Abandonment', value: fmtPct(kpi?.abandonment), subtitle: 'Inbound abandoned rate' },
    { title: 'Avg Speed of Answer', value: fmtDur(kpi?.averageSpeed), subtitle: 'Time before answer' },
    { title: 'Avg Handle Time', value: fmtDur(kpi?.averageAnsweredTime), subtitle: 'Talk + estimated wrap' },
    { title: 'Answer Rate', value: fmtPct(kpi?.serviceLevel != null ? 100 - (kpi?.abandonment ?? 0) : null), subtitle: direction !== 'all' ? `${direction} only` : 'All directions' },
  ];

  const anyLoading = kpiLoading || dashLoading;

  return (
    <ScrollArea className="h-full w-full">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 px-6 pb-10 pt-2">

        {/* Filter bar */}
        <div className="flex flex-wrap items-end gap-4 rounded-xl border bg-background p-4 shadow-sm">
          <div className="min-w-[180px] flex-1">
            <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Integration</label>
            <Select value={selectedIntegrationId} onValueChange={setSelectedIntegrationId}>
              <Select.Trigger><Select.Value placeholder="Select integration" /></Select.Trigger>
              <Select.Content>
                {uniqueIntegrations.map((i) => (
                  <Select.Item key={i.inboxId} value={i.inboxId}>{i.phone}</Select.Item>
                ))}
              </Select.Content>
            </Select>
          </div>
          <div className="min-w-[160px] flex-1">
            <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Queue</label>
            <Select value={selectedQueue} onValueChange={setSelectedQueue}>
              <Select.Trigger disabled={!queueOptions.length}><Select.Value placeholder="Select queue" /></Select.Trigger>
              <Select.Content>
                {queueOptions.map((q) => <Select.Item key={q.value} value={q.value}>{q.label}</Select.Item>)}
              </Select.Content>
            </Select>
          </div>
          <div className="min-w-[140px] flex-1">
            <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Direction</label>
            <Select value={direction} onValueChange={setDirection}>
              <Select.Trigger><Select.Value /></Select.Trigger>
              <Select.Content>
                {DIRECTION_OPTIONS.map((o) => <Select.Item key={o.value} value={o.value}>{o.label}</Select.Item>)}
              </Select.Content>
            </Select>
          </div>
          <div className="min-w-[220px] flex-1">
            <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Date Range</label>
            <Dialog>
              <Dialog.Trigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal text-sm">
                  📅 {dateRangeLabel}
                </Button>
              </Dialog.Trigger>
              <ReportDateFilter value={dateFilter} onChange={setDateFilter} />
            </Dialog>
          </div>
        </div>

        {/* Loading/empty states */}
        {(integrationsLoading || queuesLoading) && (
          <div className="flex justify-center py-10"><Spinner /></div>
        )}
        {!integrationsLoading && !uniqueIntegrations.length && (
          <div className="rounded-xl border-2 border-dashed p-12 text-center text-sm text-muted-foreground">
            No call integration found for this user.....
          </div>
        )}
        {!queuesLoading && selectedIntegrationId && uniqueIntegrations.length > 0 && !queueOptions.length && (
          <div className="rounded-xl border-2 border-dashed p-12 text-center text-sm text-muted-foreground">
            The selected integration has no assigned queues.
          </div>
        )}

        {hasQueue && (
          <>
            {/* ── KPI Scorecard ── */}
            {kpiLoading ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-28 rounded-xl border bg-muted/30 animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {kpiCards.map((card) => <KpiCard key={card.title} {...card} />)}
              </div>
            )}

            {/* ── Volume + Carrier ── */}
            <div className="grid gap-4 lg:grid-cols-3">
              <div className="lg:col-span-2 rounded-xl border bg-background p-5 shadow-sm">
                <div className="mb-4 space-y-0.5">
                  <SectionTitle color="bg-indigo-500">Call Volume Over Time</SectionTitle>
                  <p className="ml-3 text-xs text-muted-foreground">Daily inbound / outbound breakdown</p>
                </div>
                {volumeLoading ? <div className="h-64 rounded-lg bg-muted/30 animate-pulse" /> : <VolumeChart data={volumeSeries} />}
              </div>
              <div className="rounded-xl border bg-background p-5 shadow-sm">
                <div className="mb-4 space-y-0.5">
                  <SectionTitle color="bg-cyan-500">Carrier Breakdown</SectionTitle>
                  <p className="ml-3 text-xs text-muted-foreground">By Mongolian phone prefix</p>
                </div>
                {carrierLoading ? <div className="h-40 rounded-lg bg-muted/30 animate-pulse" /> : <CarrierDonut data={carrierBreakdown} />}
              </div>
            </div>

            {/* ── Heatmap ── */}
            <div className="rounded-xl border bg-background p-5 shadow-sm">
              <div className="mb-4 space-y-0.5">
                <SectionTitle color="bg-violet-500">Hour × Day Heatmap</SectionTitle>
                <p className="ml-3 text-xs text-muted-foreground">Call volume by hour of day and day of week</p>
              </div>
              {heatmapLoading ? <div className="h-48 rounded-lg bg-muted/30 animate-pulse" /> : <Heatmap data={heatmap} />}
            </div>

            {/* ── Queue Snapshot ── */}
            <div className="space-y-3">
              <SectionTitle color="bg-blue-500">Queue Snapshot</SectionTitle>
              <div className="overflow-hidden rounded-xl border shadow-sm">
                <Table>
                  <Table.Header>
                    <Table.Row className="bg-muted/50">
                      <Table.Head className="font-semibold">Queue</Table.Head>
                      <Table.Head className="font-semibold text-right">Total</Table.Head>
                      <Table.Head className="font-semibold text-right">Answered</Table.Head>
                      <Table.Head className="font-semibold text-right">Missed</Table.Head>
                      <Table.Head className="font-semibold text-right">Answer Rate</Table.Head>
                      <Table.Head className="font-semibold text-right">Avg Wait</Table.Head>
                      <Table.Head className="font-semibold text-right">Avg Talk</Table.Head>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {dashLoading ? (
                      <Table.Row><Table.Cell colSpan={7} className="py-8 text-center"><Spinner /></Table.Cell></Table.Row>
                    ) : queueStats.length === 0 ? (
                      <Table.Row>
                        <Table.Cell colSpan={7} className="py-8 text-center text-muted-foreground">No queue data for the selected range</Table.Cell>
                      </Table.Row>
                    ) : (
                      queueStats.map((stat) => (
                        <Table.Row key={stat.queue} className="hover:bg-muted/30">
                          <Table.Cell className="font-medium">{selectedQueueLabel}</Table.Cell>
                          <Table.Cell className="text-right font-semibold">{fmtNum(stat.totalCalls)}</Table.Cell>
                          <Table.Cell className="text-right">
                            <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-sm font-medium text-emerald-700">{fmtNum(stat.answeredCalls)}</span>
                          </Table.Cell>
                          <Table.Cell className="text-right">
                            <span className="inline-flex items-center rounded-md bg-rose-50 px-2 py-0.5 text-sm font-medium text-rose-700">{fmtNum(stat.abandonedCalls)}</span>
                          </Table.Cell>
                          <Table.Cell className="text-right font-medium">{fmtPct(stat.answeredRate)}</Table.Cell>
                          <Table.Cell className="text-right font-mono text-sm">{fmtDur(stat.averageWaitTime)}</Table.Cell>
                          <Table.Cell className="text-right font-mono text-sm">{fmtDur(stat.averageTalkTime)}</Table.Cell>
                        </Table.Row>
                      ))
                    )}
                  </Table.Body>
                </Table>
              </div>
            </div>

            {/* ── Agent Leaderboard ── */}
            <div className="space-y-3">
              <SectionTitle color="bg-violet-500">Agent Leaderboard</SectionTitle>
              <div className="overflow-hidden rounded-xl border shadow-sm">
                <Table>
                  <Table.Header>
                    <Table.Row className="bg-muted/50">
                      <Table.Head className="font-semibold">Agent</Table.Head>
                      <Table.Head className="font-semibold text-right">Total</Table.Head>
                      <Table.Head className="font-semibold text-right">Answered</Table.Head>
                      <Table.Head className="font-semibold text-right">Missed</Table.Head>
                      <Table.Head className="font-semibold text-right">Answer Rate</Table.Head>
                      <Table.Head className="font-semibold text-right">Avg Wait</Table.Head>
                      <Table.Head className="font-semibold text-right">Avg Talk</Table.Head>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {dashLoading ? (
                      <Table.Row><Table.Cell colSpan={7} className="py-8 text-center"><Spinner /></Table.Cell></Table.Row>
                    ) : agentStats.length === 0 ? (
                      <Table.Row>
                        <Table.Cell colSpan={7} className="py-8 text-center text-muted-foreground">No agent data</Table.Cell>
                      </Table.Row>
                    ) : (
                      agentStats.map((stat, i) => (
                        <>
                          <Table.Row
                            key={stat.agent}
                            className={cn('cursor-pointer hover:bg-muted/30', i % 2 !== 0 && 'bg-muted/10')}
                            onClick={() => setExpandedAgent(expandedAgent === stat.agent ? null : stat.agent)}
                          >
                            <Table.Cell className="font-medium">{stat.agentName || stat.agent}</Table.Cell>
                            <Table.Cell className="text-right font-semibold">{fmtNum(stat.totalCalls)}</Table.Cell>
                            <Table.Cell className="text-right">
                              <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-sm font-medium text-emerald-700">{fmtNum(stat.answeredCalls)}</span>
                            </Table.Cell>
                            <Table.Cell className="text-right">
                              <span className="inline-flex items-center rounded-md bg-rose-50 px-2 py-0.5 text-sm font-medium text-rose-700">{fmtNum(stat.missedCalls)}</span>
                            </Table.Cell>
                            <Table.Cell className="text-right font-medium">{fmtPct(stat.answeredRate)}</Table.Cell>
                            <Table.Cell className="text-right font-mono text-sm">{fmtDur(stat.averageWaitTime)}</Table.Cell>
                            <Table.Cell className="text-right font-mono text-sm">{fmtDur(stat.averageTalkTime)}</Table.Cell>
                          </Table.Row>
                          {expandedAgent === stat.agent && (
                            <Table.Row key={`${stat.agent}-detail`}>
                              <Table.Cell colSpan={7} className="bg-muted/30 px-8 py-3">
                                <div className="flex gap-6 text-xs">
                                  <div><span className="text-muted-foreground">Shortest call</span><span className="ml-2 font-mono font-semibold">{fmtDur(stat.shortestCall)}</span></div>
                                  <div><span className="text-muted-foreground">Longest call</span><span className="ml-2 font-mono font-semibold">{fmtDur(stat.longestCall)}</span></div>
                                  <div><span className="text-muted-foreground">Total talk</span><span className="ml-2 font-mono font-semibold">{fmtDur(stat.averageTalkTime * stat.answeredCalls)}</span></div>
                                  <div><span className="text-muted-foreground">Miss rate</span><span className="ml-2 font-semibold">{fmtPct(stat.missedRate)}</span></div>
                                </div>
                              </Table.Cell>
                            </Table.Row>
                          )}
                        </>
                      ))
                    )}
                  </Table.Body>
                </Table>
              </div>
            </div>

            {/* ── Callback Recovery ── */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <SectionTitle color="bg-amber-500">Callback Recovery</SectionTitle>
              </div>
              {callbackLoading ? (
                <div className="h-24 rounded-xl border bg-muted/30 animate-pulse" />
              ) : (
                <CallbackStatsSection data={callbackStats} />
              )}
            </div>

            {/* ── Top Numbers ── */}
            <div className="space-y-3">
              <SectionTitle color="bg-pink-500">Top Contact Numbers</SectionTitle>
              {topNumLoading ? (
                <div className="h-40 rounded-xl border bg-muted/30 animate-pulse" />
              ) : (
                <TopNumbersTable data={topNumbers} />
              )}
            </div>
          </>
        )}
      </div>
    </ScrollArea>
  );
};
