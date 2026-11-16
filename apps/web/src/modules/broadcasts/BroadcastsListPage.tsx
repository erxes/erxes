import { type Broadcast, BroadcastStatus } from '@erxes/core-contract';
import { orpc } from '@erxes/core-contract/client';
import { IconMail, IconMailOff, IconMessage, IconSpeakerphone } from '@tabler/icons-react';
import { useInfiniteQuery, useMutation } from '@tanstack/react-query';
import { Button, Empty, PageContainer, PageHeader, ScrollArea, useFormat } from 'erxes-ui';
import { parseAsString, parseAsStringLiteral, useQueryStates } from 'nuqs';
import { useDeferredValue } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { AppBreadcrumb } from '~/components/AppBreadcrumb';
import { QueryState } from '~/components/QueryState';
import { forwardPaging } from '~/lib/cursorList';
import { paths } from '~/lib/paths';
import { useCan } from '~/modules/auth/session';
import {
  ChannelIcon,
  flattenPages,
  LoadMore,
  OptionSelect,
  SearchBar,
  StatusBadge,
  usePercent,
} from './BroadcastBits';
import { useBroadcastHandlers } from './broadcastQueries';

const listFilters = {
  status: parseAsStringLiteral(BroadcastStatus.options),
  q: parseAsString.withDefault(''),
};

/** When it went, goes or was last touched. */
const whenOf = (broadcast: Broadcast) =>
  broadcast.finishedAt ?? broadcast.startedAt ?? broadcast.scheduledAt ?? broadcast.updatedAt;

const BroadcastRow = ({ broadcast }: { broadcast: Broadcast }) => {
  const { t } = useTranslation('broadcasts');
  const fmt = useFormat();
  const percent = usePercent();
  const { stats, total } = broadcast;

  return (
    <li>
      <Link
        to={paths.broadcasts.broadcast(broadcast.id)}
        className="flex items-center gap-4 p-4 hover:bg-muted/50"
      >
        <ChannelIcon channel={broadcast.channel} />
        <span className="min-w-0 flex-1">
          <span className="block truncate font-medium">{broadcast.name}</span>
          <span className="block truncate text-xs text-muted-foreground">
            {broadcast.subject || broadcast.body.slice(0, 120) || t('no-content', 'No content yet')}
          </span>
        </span>
        {total > 0 && (
          <span className="hidden text-xs text-muted-foreground sm:inline">
            {t('row-sent', '{{sent}} of {{total}} sent', {
              sent: fmt.number(stats.sent),
              total: fmt.number(total),
            })}
            {broadcast.channel === 'email' &&
              ` · ${t('row-opened', '{{percent}} opened', { percent: percent(stats.opened, stats.sent) })}`}
          </span>
        )}
        <span className="hidden w-36 text-right text-xs text-muted-foreground md:inline">
          {fmt.dateTime(whenOf(broadcast))}
        </span>
        <StatusBadge status={broadcast.status} />
      </Link>
    </li>
  );
};

const NoBroadcasts = () => {
  const { t } = useTranslation('broadcasts');

  return (
    <Empty>
      <Empty.Header>
        <Empty.Media variant="icon">
          <IconSpeakerphone />
        </Empty.Media>
        <Empty.Title>{t('empty', 'No broadcasts yet')}</Empty.Title>
        <Empty.Description>
          {t(
            'empty-description',
            'Write one email or SMS and send it to a saved view of customers, a filter, or everyone.',
          )}
        </Empty.Description>
      </Empty.Header>
    </Empty>
  );
};

const NewButtons = () => {
  const { t } = useTranslation('broadcasts');
  const navigate = useNavigate();
  const { onError } = useBroadcastHandlers();

  const create = useMutation(
    orpc.broadcasts.create.mutationOptions({
      onSuccess: (broadcast) => navigate(paths.broadcasts.broadcast(broadcast.id)),
      onError,
    }),
  );

  const start = (channel: Broadcast['channel']) =>
    create.mutate({
      channel,
      name:
        channel === 'email'
          ? t('untitled-email', 'Untitled email')
          : t('untitled-sms', 'Untitled SMS'),
    });

  return (
    <>
      <Button variant="outline" disabled={create.isPending} onClick={() => start('sms')}>
        <IconMessage />
        {t('new-sms', 'New SMS')}
      </Button>
      <Button disabled={create.isPending} onClick={() => start('email')}>
        <IconMail />
        {t('new-email', 'New email')}
      </Button>
    </>
  );
};

const ListHeader = () => {
  const { t } = useTranslation('broadcasts');
  const can = useCan();

  return (
    <PageHeader>
      <PageHeader.Start>
        <AppBreadcrumb
          items={[
            { label: t('title', 'Broadcasts'), to: paths.broadcasts.list, icon: IconSpeakerphone },
          ]}
        />
      </PageHeader.Start>
      <PageHeader.End>
        <Button variant="ghost" render={<Link to={paths.broadcasts.suppressions} />}>
          <IconMailOff />
          {t('suppressions', 'Suppressed addresses')}
        </Button>
        {can('broadcasts.manage') && <NewButtons />}
      </PageHeader.End>
    </PageHeader>
  );
};

/** Broadcasts: what went or goes to whom, and how it did. */
export const BroadcastsListPage = () => {
  const { t } = useTranslation('broadcasts');
  const [filters, setFilters] = useQueryStates(listFilters, { history: 'replace' });
  const search = useDeferredValue(filters.q.trim());

  const list = useInfiniteQuery(
    orpc.broadcasts.list.infiniteOptions({
      ...forwardPaging(50),
      input: (page) => ({
        ...page,
        status: filters.status ?? undefined,
        search: search || undefined,
      }),
      select: flattenPages,
    }),
  );

  const filtered = Boolean(filters.status || search);

  return (
    <PageContainer>
      <ListHeader />
      <ScrollArea className="flex-1">
        <div className="mx-auto max-w-5xl space-y-3 p-6">
          <SearchBar
            value={filters.q}
            onChange={(q) => void setFilters({ q: q || null })}
            label={t('search', 'Search broadcasts')}
          >
            <OptionSelect
              label={t('status-filter', 'Status')}
              value={filters.status}
              options={BroadcastStatus.options}
              onChange={(status) => void setFilters({ status })}
              text={(status) => t(`status.${status}`, status)}
            />
          </SearchBar>
          <QueryState
            query={list}
            className="py-12"
            isEmpty={({ rows }) => !rows.length}
            empty={
              filtered ? (
                <Empty>
                  <Empty.Description>{t('no-match', 'Nothing matches.')}</Empty.Description>
                </Empty>
              ) : (
                <NoBroadcasts />
              )
            }
          >
            {({ rows }) => (
              <div className="overflow-hidden rounded-lg border">
                <ul className="divide-y">
                  {rows.map((broadcast) => (
                    <BroadcastRow key={broadcast.id} broadcast={broadcast} />
                  ))}
                </ul>
                <LoadMore query={list} />
              </div>
            )}
          </QueryState>
        </div>
      </ScrollArea>
    </PageContainer>
  );
};
