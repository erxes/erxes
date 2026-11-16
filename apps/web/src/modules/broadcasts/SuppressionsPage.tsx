import { BroadcastChannel, type Suppression, SuppressionReason } from '@erxes/core-contract';
import { orpc } from '@erxes/core-contract/client';
import { IconMailOff, IconPlus, IconSpeakerphone, IconX } from '@tabler/icons-react';
import { useInfiniteQuery, useMutation } from '@tanstack/react-query';
import {
  Badge,
  Button,
  Empty,
  PageContainer,
  PageHeader,
  ScrollArea,
  useConfirm,
  useFormat,
} from 'erxes-ui';
import { useDeferredValue, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { AppBreadcrumb } from '~/components/AppBreadcrumb';
import { QueryState } from '~/components/QueryState';
import { forwardPaging } from '~/lib/cursorList';
import { paths } from '~/lib/paths';
import { useCan } from '~/modules/auth/session';
import { AddSuppressions } from './AddSuppressions';
import { flattenPages, LoadMore, OptionSelect, SearchBar } from './BroadcastBits';
import { useBroadcastHandlers } from './broadcastQueries';

/** Only the person can undo an unsubscribe or a complaint. */
const removable = (reason: Suppression['reason']) => reason === 'manual' || reason === 'bounced';

const SuppressionRow = ({ row, canManage }: { row: Suppression; canManage: boolean }) => {
  const { t } = useTranslation('broadcasts');
  const fmt = useFormat();
  const { confirm } = useConfirm();
  const remove = useMutation(orpc.suppressions.remove.mutationOptions(useBroadcastHandlers()));

  return (
    <li className="flex items-center gap-3 px-4 py-3">
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{row.address}</p>
        <p className="truncate text-xs text-muted-foreground">
          {fmt.dateTime(row.createdAt)}
          {row.detail && ` · ${row.detail}`}
          {row.broadcastId && (
            <>
              {' · '}
              <Link to={paths.broadcasts.broadcast(row.broadcastId)} className="hover:underline">
                {t('from-broadcast', 'from a broadcast')}
              </Link>
            </>
          )}
        </p>
      </div>
      <Badge variant="secondary">{t(`channel.${row.channel}`, row.channel)}</Badge>
      <Badge variant={row.reason === 'manual' ? 'muted' : 'warning'}>
        {t(`reason.${row.reason}`, row.reason)}
      </Badge>
      {canManage && removable(row.reason) && (
        <Button
          variant="ghost"
          size="icon"
          aria-label={t('unsuppress', 'Allow again')}
          disabled={remove.isPending}
          onClick={() =>
            void confirm({
              message: t('unsuppress-confirm', 'Let broadcasts reach {{address}} again?', {
                address: row.address,
              }),
              options: { okLabel: t('unsuppress', 'Allow again') },
            }).then(() => remove.mutate({ id: row.id }))
          }
        >
          <IconX />
        </Button>
      )}
    </li>
  );
};

const NoSuppressions = () => {
  const { t } = useTranslation('broadcasts');

  return (
    <Empty>
      <Empty.Header>
        <Empty.Media variant="icon">
          <IconMailOff />
        </Empty.Media>
        <Empty.Title>{t('suppressions-empty', 'No suppressed addresses')}</Empty.Title>
        <Empty.Description>
          {t(
            'suppressions-empty-description',
            'Addresses that unsubscribe or bounce land here and get no more broadcasts.',
          )}
        </Empty.Description>
      </Empty.Header>
    </Empty>
  );
};

const SuppressionsHeader = ({ canManage }: { canManage: boolean }) => {
  const { t } = useTranslation('broadcasts');
  const [adding, setAdding] = useState(false);

  return (
    <PageHeader>
      <PageHeader.Start>
        <AppBreadcrumb
          items={[
            { label: t('title', 'Broadcasts'), to: paths.broadcasts.list, icon: IconSpeakerphone },
            { label: t('suppressions', 'Suppressed addresses'), to: paths.broadcasts.suppressions },
          ]}
        />
      </PageHeader.Start>
      <PageHeader.End>
        {canManage && (
          <Button onClick={() => setAdding(true)}>
            <IconPlus />
            {t('add-suppressions', 'Add addresses')}
          </Button>
        )}
        <AddSuppressions open={adding} onOpenChange={setAdding} />
      </PageHeader.End>
    </PageHeader>
  );
};

/** Addresses no broadcast goes to: unsubscribed, bounced, complained or added by the team. */
export const SuppressionsPage = () => {
  const { t } = useTranslation('broadcasts');
  const canManage = useCan()('broadcasts.manage');
  const [channel, setChannel] = useState<Suppression['channel'] | null>(null);
  const [reason, setReason] = useState<Suppression['reason'] | null>(null);
  const [q, setQ] = useState('');
  const search = useDeferredValue(q.trim());

  const list = useInfiniteQuery(
    orpc.suppressions.list.infiniteOptions({
      ...forwardPaging(50),
      input: (page) => ({
        ...page,
        channel: channel ?? undefined,
        reason: reason ?? undefined,
        search: search || undefined,
      }),
      select: flattenPages,
    }),
  );

  return (
    <PageContainer>
      <SuppressionsHeader canManage={canManage} />
      <ScrollArea className="flex-1">
        <div className="mx-auto max-w-4xl space-y-3 p-6">
          <SearchBar value={q} onChange={setQ} label={t('suppressions-search', 'Search addresses')}>
            <OptionSelect
              label={t('channel-filter', 'Channel')}
              value={channel}
              options={BroadcastChannel.options}
              onChange={setChannel}
              text={(option) => t(`channel.${option}`, option)}
            />
            <OptionSelect
              label={t('reason-filter', 'Reason')}
              value={reason}
              options={SuppressionReason.options}
              onChange={setReason}
              text={(option) => t(`reason.${option}`, option)}
            />
          </SearchBar>
          <QueryState
            query={list}
            className="py-12"
            isEmpty={({ rows }) => !rows.length}
            empty={<NoSuppressions />}
          >
            {({ rows }) => (
              <div className="overflow-hidden rounded-lg border">
                <ul className="divide-y">
                  {rows.map((row) => (
                    <SuppressionRow key={row.id} row={row} canManage={canManage} />
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
