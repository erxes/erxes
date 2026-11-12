import type { AuditEntry } from '@erxes/core-contract';
import {
  IconChevronDown,
  IconChevronRight,
  IconDownload,
  IconSearch,
  IconShieldCheck,
  IconShieldX,
} from '@tabler/icons-react';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Badge,
  Button,
  cn,
  DropdownMenu,
  Empty,
  Input,
  PageContainer,
  PageSubHeader,
  Popover,
  RelativeDateDisplay,
  ScrollArea,
  Select,
  Spinner,
  useToast,
} from 'erxes-ui';
import { Fragment, useDeferredValue, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';
import { PageHeader } from 'ui-modules';
import { AppBreadcrumb } from '~/components/AppBreadcrumb';
import { UserAvatar } from '~/components/UserAvatar';
import { api, messageOf } from '~/lib/api';
import { actorLabel, pluginLabel, useMembersById } from '~/lib/members';
import { useCan, useSession } from '~/modules/auth/session';
import { usePlugins } from '~/modules/plugins/usePlugins';
import { AuditStreams } from './AuditStreams';
import { auditSentence } from './auditSentence';

/** Filter by area: an action prefix. */
const AREAS = [
  { value: 'all', label: 'Everything' },
  { value: 'auth.', label: 'Sign-ins' },
  { value: 'user.', label: 'Team members' },
  { value: 'customer.', label: 'Customers' },
  { value: 'company.', label: 'Companies' },
  { value: 'tag.', label: 'Tags' },
  { value: 'field*', label: 'Properties' },
  { value: 'file.', label: 'Files' },
  { value: 'settings.', label: 'Settings' },
  { value: 'audit.', label: 'Audit log' },
] as const;

const isWarning = (action: string) => /deleted|merged|failed|disabled|role_changed|exported|password/.test(action);

const formatValue = (value: unknown) => {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'string') return value.length > 80 ? `${value.slice(0, 80)}…` : value;

  return JSON.stringify(value);
};

/** `YYYY-MM-DD` (local) → the ISO instant that day starts, or the next day starts for `to`. */
const dayBoundary = (day: string, end: boolean) => {
  if (!day) return undefined;

  const date = new Date(`${day}T00:00:00`);

  if (end) date.setDate(date.getDate() + 1);

  return date.toISOString();
};

interface Filters {
  area: string;
  actorId: string;
  source: string;
  from: string;
  to: string;
  ip: string;
  q: string;
}

const queryOf = (filters: Filters) => ({
  action: filters.area === 'all' ? undefined : filters.area,
  actorId: filters.actorId === 'all' ? undefined : filters.actorId,
  source: filters.source === 'all' ? undefined : filters.source,
  from: dayBoundary(filters.from, false),
  to: dayBoundary(filters.to, true),
  ip: filters.ip.trim() || undefined,
  q: filters.q.trim() || undefined,
});

const EntryDetails = ({ entry }: { entry: AuditEntry }) => (
  <div className="space-y-2 bg-muted/40 px-12 py-3 text-xs">
    {entry.changes && (
      <table className="w-full max-w-2xl">
        <tbody>
          {Object.entries(entry.changes).map(([field, [before, after]]) => (
            <tr key={field} className="align-top">
              <td className="w-40 py-0.5 pr-3 font-medium">{field}</td>
              <td className="py-0.5 pr-3 text-muted-foreground line-through">{formatValue(before)}</td>
              <td className="py-0.5">{formatValue(after)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    )}
    {entry.metadata && (
      <pre className="max-w-2xl overflow-x-auto rounded bg-background p-2 text-[11px]">
        {JSON.stringify(entry.metadata, null, 2)}
      </pre>
    )}
    <p className="text-muted-foreground">
      <span className="font-mono">{entry.action}</span>
      {[entry.ip && ` · IP ${entry.ip}`, entry.userAgent && ` · ${entry.userAgent}`].filter(Boolean).join('')}
      {entry.targetId && ` · ${entry.targetType} ${entry.targetId}`}
    </p>
  </div>
);

/**
 * Every signed checkpoint as JSON, to keep outside erxes: with the public keys
 * (`/core/v1/.well-known/jwks.json`) anyone can later prove what the log held.
 */
const downloadCheckpoints = async () => {
  const all: unknown[] = [];
  let after: number | undefined;

  for (;;) {
    const page = await api.audit.checkpoints({ after, limit: 1000 });

    all.push(...page.data);

    if (page.data.length < 1000) break;

    after = page.data[page.data.length - 1]!.chainSeq;
  }

  const blob = new Blob([JSON.stringify({ jwks: '/core/v1/.well-known/jwks.json', checkpoints: all }, null, 2)], {
    type: 'application/json',
  });
  const link = document.createElement('a');

  link.href = URL.createObjectURL(blob);
  link.download = `audit-checkpoints-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(link.href);
};

/** Re-checks the hash chain and the signed checkpoints: has any entry been changed or removed? */
const IntegrityCheck = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'audit-log' });
  const verify = useMutation({ mutationFn: () => api.audit.verify() });
  const result = verify.data;

  return (
    <Popover onOpenChange={(open) => open && verify.mutate()}>
      <Popover.Trigger asChild>
        <Button variant="ghost">
          <IconShieldCheck />
          {t('verify', 'Check integrity')}
        </Button>
      </Popover.Trigger>
      <Popover.Content align="end" className="w-80 text-sm">
        {verify.isPending || !result ? (
          <Spinner containerClassName="py-4" />
        ) : (
          <div className="space-y-3">
            {result.ok ? (
              <div className="flex gap-3">
                <IconShieldCheck className="size-5 shrink-0 text-green-600" />
                <p>
                  {t('verify-ok', {
                    count: result.checked,
                    defaultValue: `All ${result.checked} entries are intact: none was changed or removed.`,
                  })}
                </p>
              </div>
            ) : (
              <div className="flex gap-3">
                <IconShieldX className="size-5 shrink-0 text-destructive" />
                <p>
                  {result.brokenAt !== null
                    ? t('verify-broken', {
                        position: result.brokenAt,
                        defaultValue: `The chain breaks at entry #${result.brokenAt}: an entry was changed or removed outside erxes.`,
                      })
                    : t('verify-checkpoint-mismatch', {
                        position: result.checkpoints.mismatchAt,
                        defaultValue: `The log no longer matches signed checkpoint #${result.checkpoints.mismatchAt}: entries were rewritten or removed outside erxes.`,
                      })}
                </p>
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              {result.checkpoints.latestAt
                ? t('verify-checkpoints', {
                    count: result.checkpoints.checked,
                    defaultValue: `${result.checkpoints.checked} signed checkpoints checked. erxes signs the chain every 10 minutes with a key kept outside the database.`,
                  })
                : t('verify-no-checkpoints', 'No signed checkpoint yet: erxes signs the chain every 10 minutes.')}
            </p>
            <Button variant="outline" size="sm" onClick={() => void downloadCheckpoints()}>
              <IconDownload />
              {t('download-checkpoints', 'Download signed checkpoints')}
            </Button>
          </div>
        )}
      </Popover.Content>
    </Popover>
  );
};

/** How long entries are kept (owners). */
const Retention = ({ isOwner }: { isOwner: boolean }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'audit-log' });
  const client = useQueryClient();
  const { toast } = useToast();
  const { data } = useQuery({ queryKey: ['settings', 'audit'], queryFn: () => api.audit.settings() });
  const [days, setDays] = useState('');
  const save = useMutation({
    mutationFn: () => api.audit.updateSettings({ retentionDays: Number(days) }),
    onSuccess: (next) => {
      client.setQueryData(['settings', 'audit'], next);
      toast({ title: t('retention-saved', 'Retention saved') });
    },
    onError: (error) => toast({ variant: 'destructive', title: t('retention-failed', 'Could not save'), description: messageOf(error) }),
  });

  if (!data) return null;

  return (
    <Popover onOpenChange={(open) => open && setDays(String(data.retentionDays))}>
      <Popover.Trigger asChild>
        <Button variant="ghost" className="text-muted-foreground">
          {t('kept-for', { days: data.retentionDays, defaultValue: `Kept ${data.retentionDays} days` })}
        </Button>
      </Popover.Trigger>
      <Popover.Content align="end" className="w-72 space-y-3 text-sm">
        <p>
          {t('retention-description', {
            max: data.maxRetentionDays,
            defaultValue: `Older entries are deleted automatically. This server keeps them up to ${data.maxRetentionDays} days.`,
          })}
        </p>
        {isOwner ? (
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min={30}
              max={data.maxRetentionDays}
              value={days}
              onChange={(event) => setDays(event.target.value)}
              className="w-24"
            />
            <span className="text-muted-foreground">{t('days', 'days')}</span>
            <Button
              size="sm"
              className="ml-auto"
              disabled={save.isPending || Number(days) < 30 || Number(days) > data.maxRetentionDays}
              onClick={() => save.mutate()}
            >
              {t('save', 'Save')}
            </Button>
          </div>
        ) : (
          <p className="text-muted-foreground">{t('owner-only', 'Only owners can change this.')}</p>
        )}
      </Popover.Content>
    </Popover>
  );
};

/** Settings › Audit log: who changed what, in core and every plugin (owners and admins). */
export const AuditLogPage = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'audit-log' });
  const { user } = useSession();
  const { plugins } = usePlugins();
  const [filters, setFilters] = useState<Filters>({ area: 'all', actorId: 'all', source: 'all', from: '', to: '', ip: '', q: '' });
  const [open, setOpen] = useState<string | null>(null);
  const deferred = useDeferredValue(filters);
  const can = useCan();
  const canSee = can('audit.view');
  const query = queryOf(deferred);
  const set = (patch: Partial<Filters>) => setFilters((current) => ({ ...current, ...patch }));

  const list = useInfiniteQuery({
    queryKey: ['audit', query],
    queryFn: ({ pageParam }) =>
      api.audit.list({ limit: 50, cursor: pageParam, direction: 'forward', cursorMode: 'exclusive', ...query }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => (last.pageInfo.hasNextPage ? (last.pageInfo.endCursor ?? undefined) : undefined),
    enabled: canSee,
  });
  const entries = list.data?.pages.flatMap((page) => page.data) ?? [];
  const first = list.data?.pages[0];
  const members = useMembersById(entries.map((entry) => (entry.actor.type === 'user' ? entry.actor.id : null)));
  const team = useQuery({ queryKey: ['users', 'audit-filter'], queryFn: () => api.users.list({ limit: 100 }), enabled: canSee });
  const sources = ['core', ...new Set(plugins.map((plugin) => plugin.config.name.toLowerCase()))];
  const exportUrl = (format: 'csv' | 'json') => {
    const params = new URLSearchParams({ format });

    Object.entries(query).forEach(([key, value]) => value && params.set(key, value));

    return `/core/v1/audit/export?${params}`;
  };

  if (!canSee) {
    return <Navigate to="/settings" replace />;
  }

  return (
    <PageContainer>
      <PageHeader>
        <PageHeader.Start>
          <AppBreadcrumb items={[{ label: t('title', 'Audit log'), to: '/settings/audit-log', icon: IconShieldCheck }]} />
        </PageHeader.Start>
        <PageHeader.End>
          <Retention isOwner={can('audit.retention')} />
          {can('audit.stream') && <AuditStreams />}
          <IntegrityCheck />
          <DropdownMenu>
            <DropdownMenu.Trigger asChild>
              <Button variant="outline">
                <IconDownload />
                {t('export', 'Export')}
              </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content align="end">
              <DropdownMenu.Item asChild>
                <a href={exportUrl('csv')}>{t('export-csv', 'CSV (spreadsheets)')}</a>
              </DropdownMenu.Item>
              <DropdownMenu.Item asChild>
                <a href={exportUrl('json')}>{t('export-json', 'JSON (SIEM, scripts)')}</a>
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu>
        </PageHeader.End>
      </PageHeader>
      <PageSubHeader className="flex-wrap items-center gap-2">
        <div className="relative">
          <IconSearch className="absolute top-1.5 left-2 size-4 text-muted-foreground" />
          <Input
            value={filters.q}
            onChange={(event) => set({ q: event.target.value })}
            placeholder={t('search', 'Search actions and records')}
            className="h-7 w-56 pl-7"
          />
        </div>
        <Select value={filters.area} onValueChange={(area) => set({ area })}>
          <Select.Trigger className="h-7 w-36">
            <Select.Value />
          </Select.Trigger>
          <Select.Content>
            {AREAS.map((item) => (
              <Select.Item key={item.value} value={item.value}>
                {t(`areas.${item.value.replace(/[.*]/g, '')}`, item.label)}
              </Select.Item>
            ))}
          </Select.Content>
        </Select>
        <Select value={filters.source} onValueChange={(source) => set({ source })}>
          <Select.Trigger className="h-7 w-32">
            <Select.Value />
          </Select.Trigger>
          <Select.Content>
            <Select.Item value="all">{t('all-sources', 'All sources')}</Select.Item>
            {sources.map((source) => (
              <Select.Item key={source} value={source}>
                {source === 'core' ? 'erxes' : pluginLabel(source)}
              </Select.Item>
            ))}
          </Select.Content>
        </Select>
        <Select value={filters.actorId} onValueChange={(actorId) => set({ actorId })}>
          <Select.Trigger className="h-7 w-44">
            <Select.Value />
          </Select.Trigger>
          <Select.Content>
            <Select.Item value="all">{t('anyone', 'Anyone')}</Select.Item>
            {(team.data?.data ?? []).map((member) => (
              <Select.Item key={member.id} value={member.id}>
                {member.fullName || member.email}
              </Select.Item>
            ))}
          </Select.Content>
        </Select>
        <Input type="date" value={filters.from} onChange={(event) => set({ from: event.target.value })} className="h-7 w-36" aria-label={t('from', 'From')} />
        <span className="text-muted-foreground">–</span>
        <Input type="date" value={filters.to} onChange={(event) => set({ to: event.target.value })} className="h-7 w-36" aria-label={t('to', 'To')} />
        <Input value={filters.ip} onChange={(event) => set({ ip: event.target.value })} placeholder="IP" className="h-7 w-32" />
        <span className="ml-auto text-sm text-muted-foreground">
          {first
            ? first.totalCapped
              ? t('count-capped', { count: first.totalCount, defaultValue: `${first.totalCount.toLocaleString()}+ entries` })
              : t('count', { count: first.totalCount, defaultValue: `${first.totalCount} entries` })
            : null}
        </span>
      </PageSubHeader>
      <ScrollArea className="flex-1">
        {list.isPending ? (
          <Spinner containerClassName="py-12" />
        ) : !entries.length ? (
          <Empty className="py-12">
            <Empty.Header>
              <Empty.Media variant="icon">
                <IconShieldCheck />
              </Empty.Media>
              <Empty.Title>{t('empty', 'Nothing recorded yet')}</Empty.Title>
              <Empty.Description>
                {t('empty-description', 'Sign-ins, team changes, deletes and settings changes appear here.')}
              </Empty.Description>
            </Empty.Header>
          </Empty>
        ) : (
          <div className="m-3 overflow-hidden rounded-lg border bg-background">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50 text-left text-xs text-muted-foreground">
                <tr>
                  <th className="w-8" />
                  <th className="px-3 py-2 font-medium">{t('when', 'When')}</th>
                  <th className="px-3 py-2 font-medium">{t('who', 'Who')}</th>
                  <th className="px-3 py-2 font-medium">{t('what', 'What')}</th>
                  <th className="px-3 py-2 font-medium">IP</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => {
                  const who = actorLabel(entry.actor, members, t('deleted-member', 'A removed member'));
                  const member = entry.actor.type === 'user' && entry.actor.id ? members.get(entry.actor.id) : undefined;
                  const expanded = open === entry.id;

                  return (
                    <Fragment key={entry.id}>
                      <tr className="cursor-pointer border-b last:border-0 hover:bg-accent/50" onClick={() => setOpen(expanded ? null : entry.id)}>
                        <td className="pl-3 text-muted-foreground">
                          {expanded ? <IconChevronDown className="size-4" /> : <IconChevronRight className="size-4" />}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-muted-foreground">
                          <RelativeDateDisplay value={entry.createdAt} asChild>
                            <span>
                              <RelativeDateDisplay.Value value={entry.createdAt} />
                            </span>
                          </RelativeDateDisplay>
                        </td>
                        <td className="px-3 py-2">
                          <span className="flex items-center gap-2">
                            <UserAvatar name={who} src={member?.avatarUrl} className="size-5" />
                            <span className="truncate">{who}</span>
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          <span className="flex flex-wrap items-center gap-1.5">
                            {isWarning(entry.action) && <span className="size-1.5 rounded-full bg-destructive" aria-hidden="true" />}
                            <span className={cn(isWarning(entry.action) && 'font-medium')}>
                              {auditSentence(entry)}
                            </span>
                            {entry.source !== 'core' && (
                              <Badge variant="secondary" className="h-4 px-1.5 text-[10px]">
                                {pluginLabel(entry.source)}
                              </Badge>
                            )}
                          </span>
                        </td>
                        <td className="px-3 py-2 font-mono text-xs whitespace-nowrap text-muted-foreground">{entry.ip ?? '—'}</td>
                      </tr>
                      {expanded && (
                        <tr className="border-b">
                          <td colSpan={5} className="p-0">
                            <EntryDetails entry={entry} />
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
            {list.hasNextPage && (
              <div className="flex justify-center border-t py-2">
                <Button variant="ghost" size="sm" disabled={list.isFetchingNextPage} onClick={() => void list.fetchNextPage()}>
                  {list.isFetchingNextPage ? <Spinner size="sm" /> : t('load-more', 'Load more')}
                </Button>
              </div>
            )}
          </div>
        )}
      </ScrollArea>
    </PageContainer>
  );
};
