import type { AuditEntry } from '@erxes/core-contract';
import { IconChevronDown, IconChevronRight, IconShieldCheck } from '@tabler/icons-react';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import {
  Badge,
  Button,
  cn,
  Empty,
  PageContainer,
  PageSubHeader,
  RelativeDateDisplay,
  ScrollArea,
  Select,
  Spinner,
} from 'erxes-ui';
import { Fragment, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';
import { PageHeader } from 'ui-modules';
import { AppBreadcrumb } from '~/components/AppBreadcrumb';
import { UserAvatar } from '~/components/UserAvatar';
import { api } from '~/lib/api';
import { actorLabel, useMembersById } from '~/lib/members';
import { useSession } from '~/modules/auth/session';

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
] as const;

/** `customer.updated` → "Customer updated"; core's own wording where it has one. */
const ACTION_LABELS: Record<string, string> = {
  'auth.signed_in': 'Signed in',
  'auth.sign_in_failed': 'Failed sign-in',
  'organization.created': 'Organisation created',
  'user.invited': 'Invited a team member',
  'user.updated': 'Updated a team member',
  'user.role_changed': 'Changed a role',
  'user.password_set': 'Set a password',
  'user.disabled': 'Deactivated a team member',
  'user.enabled': 'Reactivated a team member',
  'settings.files_changed': 'Changed upload settings',
};

const actionLabel = (action: string) => {
  if (ACTION_LABELS[action]) return ACTION_LABELS[action];

  const [record = '', verb = ''] = action.split('.');
  const text = `${record.replace(/_/g, ' ')} ${verb.replace(/_/g, ' ')}`.trim();

  return text.charAt(0).toUpperCase() + text.slice(1);
};

const isWarning = (action: string) => /deleted|merged|failed|disabled|role_changed/.test(action);

const formatValue = (value: unknown) => {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'string') return value.length > 80 ? `${value.slice(0, 80)}…` : value;

  return JSON.stringify(value);
};

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
      {[entry.ip && `IP ${entry.ip}`, entry.userAgent].filter(Boolean).join(' · ') || '—'}
      {entry.targetId && ` · ${entry.targetType} ${entry.targetId}`}
    </p>
  </div>
);

/** Settings › Audit log: who changed what (owners and admins). */
export const AuditLogPage = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'audit-log' });
  const { user } = useSession();
  const [area, setArea] = useState<string>('all');
  const [actorId, setActorId] = useState<string>('all');
  const [open, setOpen] = useState<string | null>(null);
  const canSee = user.role !== 'member';

  const query = useInfiniteQuery({
    queryKey: ['audit', { area, actorId }],
    queryFn: ({ pageParam }) =>
      api.audit.list({
        limit: 50,
        cursor: pageParam,
        direction: 'forward',
        cursorMode: 'exclusive',
        action: area === 'all' ? undefined : area,
        actorId: actorId === 'all' ? undefined : actorId,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => (last.pageInfo.hasNextPage ? (last.pageInfo.endCursor ?? undefined) : undefined),
    enabled: canSee,
  });
  const entries = query.data?.pages.flatMap((page) => page.data) ?? [];
  const total = query.data?.pages[0]?.totalCount ?? 0;
  const members = useMembersById(entries.map((entry) => (entry.actor.type === 'user' ? entry.actor.id : null)));
  const team = useQuery({
    queryKey: ['users', 'audit-filter'],
    queryFn: () => api.users.list({ limit: 100 }),
    enabled: canSee,
  });

  if (!canSee) {
    return <Navigate to="/settings" replace />;
  }

  return (
    <PageContainer>
      <PageHeader>
        <PageHeader.Start>
          <AppBreadcrumb items={[{ label: t('title', 'Audit log'), to: '/settings/audit-log', icon: IconShieldCheck }]} />
        </PageHeader.Start>
      </PageHeader>
      <PageSubHeader className="items-center gap-2">
        <Select value={area} onValueChange={setArea}>
          <Select.Trigger className="h-7 w-44">
            <Select.Value />
          </Select.Trigger>
          <Select.Content>
            {AREAS.map((item) => (
              <Select.Item key={item.value} value={item.value}>
                {t(`areas.${item.value.replace(/[.*]/g, "")}`, item.label)}
              </Select.Item>
            ))}
          </Select.Content>
        </Select>
        <Select value={actorId} onValueChange={setActorId}>
          <Select.Trigger className="h-7 w-52">
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
        <span className="ml-auto text-sm text-muted-foreground">
          {t('count', { count: total, defaultValue: `${total} entries` })}
        </span>
      </PageSubHeader>
      <ScrollArea className="flex-1">
        {query.isPending ? (
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
                  <th className="px-3 py-2 font-medium">{t('target', 'Record')}</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => {
                  const who = actorLabel(entry.actor, members, t('deleted-member', 'A removed member'));
                  const expandable = Boolean(entry.changes || entry.metadata || entry.ip);
                  const expanded = open === entry.id;

                  return (
                    <Fragment key={entry.id}>
                      <tr
                        className={cn('border-b last:border-0', expandable && 'cursor-pointer hover:bg-accent/50')}
                        onClick={() => expandable && setOpen(expanded ? null : entry.id)}
                      >
                        <td className="pl-3 text-muted-foreground">
                          {expandable &&
                            (expanded ? <IconChevronDown className="size-4" /> : <IconChevronRight className="size-4" />)}
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
                            <UserAvatar name={who} className="size-5" />
                            <span className="truncate">{who}</span>
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          <Badge variant={isWarning(entry.action) ? 'destructive' : 'secondary'} className="font-normal">
                            {t(`actions.${entry.action}`, actionLabel(entry.action))}
                          </Badge>
                        </td>
                        <td className="max-w-xs truncate px-3 py-2">{entry.targetLabel ?? entry.targetId ?? '—'}</td>
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
            {query.hasNextPage && (
              <div className="flex justify-center border-t py-2">
                <Button variant="ghost" size="sm" disabled={query.isFetchingNextPage} onClick={() => void query.fetchNextPage()}>
                  {query.isFetchingNextPage ? <Spinner size="sm" /> : t('load-more', 'Load more')}
                </Button>
              </div>
            )}
          </div>
        )}
      </ScrollArea>
    </PageContainer>
  );
};
