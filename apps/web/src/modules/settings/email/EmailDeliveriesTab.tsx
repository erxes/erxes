import { type EmailDelivery, EmailDeliveryStatus, EmailSource } from '@erxes/core-contract';
import { orpc } from '@erxes/core-contract/client';
import { IconMail } from '@tabler/icons-react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Badge, Empty, useFormat } from 'erxes-ui';
import { useDeferredValue, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { QueryState } from '~/components/QueryState';
import { forwardPaging } from '~/lib/cursorList';
import { paths } from '~/lib/paths';
import {
  flattenPages,
  LoadMore,
  OptionSelect,
  SearchBar,
} from '~/modules/broadcasts/BroadcastBits';

const STATUS_VARIANT = {
  queued: 'warning',
  sent: 'info',
  delivered: 'success',
  bounced: 'destructive',
  complained: 'destructive',
  failed: 'destructive',
  suppressed: 'muted',
  held: 'warning',
  capped: 'muted',
} as const satisfies Record<EmailDelivery['status'], string>;

/** Waiting, trying again after a refusal, sent, failed, or what the provider reported. */
const StatusBadge = ({ row }: { row: EmailDelivery }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.email.deliveries' });
  const retrying = row.status === 'queued' && row.attempts > 0;

  return (
    <Badge variant={STATUS_VARIANT[row.status]} size="sm">
      {retrying
        ? t('status-retrying', 'Trying again ({{count}})', { count: row.attempts })
        : t(`status.${row.status}`, row.status)}
    </Badge>
  );
};

/** Where it came from, linked when core has a page for it. */
const SourceLabel = ({ row }: { row: EmailDelivery }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.email.deliveries' });
  const label = t(`source.${row.source}`, row.source);

  if (row.source === 'broadcast' && row.sourceId) {
    return (
      <Link to={paths.broadcasts.broadcast(row.sourceId)} className="hover:underline">
        {label}
      </Link>
    );
  }

  return (
    <span>{row.source === 'plugin' && row.sourceId ? `${label} · ${row.sourceId}` : label}</span>
  );
};

/** What it went out through; `log` sent nothing (development's `EMAIL_DRIVER=log`). */
const ProviderLabel = ({ provider }: { provider: NonNullable<EmailDelivery['provider']> }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.email.deliveries' });

  return <> · {t(`provider.${provider}`, provider)}</>;
};

const DeliveryRow = ({ row }: { row: EmailDelivery }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.email.deliveries' });
  const fmt = useFormat();

  return (
    <li className="flex items-start gap-3 px-4 py-3">
      <div className="min-w-0 flex-1 space-y-0.5">
        <p className="truncate text-sm font-medium">{row.to}</p>
        <p className="truncate text-sm">{row.subject}</p>
        <p className="truncate text-xs text-muted-foreground">
          {fmt.dateTime(row.createdAt)} · <SourceLabel row={row} />
          {row.provider && <ProviderLabel provider={row.provider} />}
          {row.reportedAt &&
            ` · ${t(`reported.${row.status}`, row.status)} ${fmt.dateTime(row.reportedAt)}`}
          {row.deferrals > 0 &&
            ` · ${t('deferrals', 'Delayed {{count}} times', { count: row.deferrals })}`}
        </p>
        {row.status === 'suppressed' ? (
          <p className="text-xs text-muted-foreground">
            {t('suppressed-because', 'Not sent: the address is suppressed ({{reason}})', {
              reason: t(`reason.${row.error ?? ''}`, row.error ?? ''),
            })}
          </p>
        ) : row.status === 'held' || row.status === 'capped' ? (
          <p className="text-xs text-muted-foreground">
            {t(`hold.${row.error ?? ''}`, row.error ?? '')}
          </p>
        ) : (
          row.error && <p className="text-xs break-words text-destructive-text">{row.error}</p>
        )}
      </div>
      <StatusBadge row={row} />
    </li>
  );
};

const NoDeliveries = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.email.deliveries' });

  return (
    <Empty>
      <Empty.Header>
        <Empty.Media variant="icon">
          <IconMail />
        </Empty.Media>
        <Empty.Title>{t('empty', 'No emails yet')}</Empty.Title>
        <Empty.Description>
          {t('empty-description', 'Every email the organisation sends shows here for 90 days.')}
        </Empty.Description>
      </Empty.Header>
    </Empty>
  );
};

/**
 * Every email the organisation sent in the last 90 days: to whom, what for,
 * and whether the server took it. Refreshes while any is still waiting.
 */
export const EmailDeliveriesTab = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.email.deliveries' });
  const [status, setStatus] = useState<EmailDelivery['status'] | null>(null);
  const [source, setSource] = useState<EmailDelivery['source'] | null>(null);
  const [q, setQ] = useState('');
  const search = useDeferredValue(q.trim());

  const list = useInfiniteQuery(
    orpc.emails.deliveries.infiniteOptions({
      ...forwardPaging(50),
      input: (page) => ({
        ...page,
        status: status ?? undefined,
        source: source ?? undefined,
        search: search || undefined,
      }),
      select: flattenPages,
      refetchInterval: (query) =>
        query.state.data?.pages.some((page) => page.data.some((row) => row.status === 'queued'))
          ? 5000
          : false,
    }),
  );

  return (
    <div className="space-y-3">
      <SearchBar value={q} onChange={setQ} label={t('search', 'Search addresses')}>
        <OptionSelect
          label={t('status-filter', 'Status')}
          value={status}
          options={EmailDeliveryStatus.options}
          onChange={setStatus}
          text={(option) => t(`status.${option}`, option)}
        />
        <OptionSelect
          label={t('source-filter', 'Sent for')}
          value={source}
          options={EmailSource.options}
          onChange={setSource}
          text={(option) => t(`source.${option}`, option)}
        />
      </SearchBar>
      <QueryState
        query={list}
        className="py-12"
        isEmpty={({ rows }) => !rows.length}
        empty={<NoDeliveries />}
      >
        {({ rows }) => (
          <div className="overflow-hidden rounded-lg border">
            <ul className="divide-y">
              {rows.map((row) => (
                <DeliveryRow key={row.id} row={row} />
              ))}
            </ul>
            <LoadMore query={list} />
          </div>
        )}
      </QueryState>
    </div>
  );
};
