import {
  type Broadcast,
  type BroadcastRecipient as Recipient,
  BroadcastRecipientStatus,
} from '@erxes/core-contract';
import { orpc } from '@erxes/core-contract/client';
import { IconCheck } from '@tabler/icons-react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Badge, useFormat } from 'erxes-ui';
import { useDeferredValue, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { EmptyList } from '~/components/EmptyList';
import { QueryState } from '~/components/QueryState';
import { forwardPaging } from '~/lib/cursorList';
import { paths } from '~/lib/paths';
import { flattenPages, LoadMore, OptionSelect, SearchBar } from './BroadcastBits';

const RECIPIENT_BADGE = {
  queued: 'secondary',
  sending: 'default',
  sent: 'success',
  failed: 'destructive',
  skipped: 'muted',
} as const satisfies Record<Recipient['status'], string>;

const Seen = ({ at }: { at: string | null }) => {
  const fmt = useFormat();

  return at ? (
    <span title={fmt.dateTime(at)}>
      <IconCheck className="size-4 text-success" />
    </span>
  ) : null;
};

const RecipientRow = ({ row, email }: { row: Recipient; email: boolean }) => {
  const { t } = useTranslation('broadcasts');
  const fmt = useFormat();

  return (
    <tr>
      <td className="max-w-0 px-3 py-2">
        <Link
          to={paths.contacts.customer(row.customerId)}
          className="block truncate font-medium hover:underline"
        >
          {row.customerName || row.address}
        </Link>
        <span className="block truncate text-xs text-muted-foreground">{row.address}</span>
      </td>
      <td className="px-3 py-2">
        <Badge variant={RECIPIENT_BADGE[row.status]}>
          {t(`recipient-status.${row.status}`, row.status)}
        </Badge>
        {row.reason && (
          <span
            className="block max-w-56 truncate text-xs text-muted-foreground"
            title={row.reason}
          >
            {row.reason}
          </span>
        )}
      </td>
      <td className="px-3 py-2 text-xs whitespace-nowrap text-muted-foreground">
        {row.sentAt ? fmt.dateTime(row.sentAt) : '—'}
      </td>
      {email && (
        <td className="px-3 py-2">
          <Seen at={row.openedAt} />
        </td>
      )}
      <td className="px-3 py-2">
        <Seen at={row.clickedAt} />
      </td>
    </tr>
  );
};

const Head = ({ email }: { email: boolean }) => {
  const { t } = useTranslation('broadcasts');

  return (
    <thead className="border-b bg-muted/50 text-left text-xs text-muted-foreground">
      <tr>
        <th className="px-3 py-2 font-medium">{t('recipient', 'Recipient')}</th>
        <th className="px-3 py-2 font-medium">{t('status-filter', 'Status')}</th>
        <th className="px-3 py-2 font-medium">{t('sent-at', 'Sent')}</th>
        {email && <th className="px-3 py-2 font-medium">{t('opened', 'Opened')}</th>}
        <th className="px-3 py-2 font-medium">{t('clicked', 'Clicked')}</th>
      </tr>
    </thead>
  );
};

/** Who it went to and what became of each copy. */
export const RecipientsTable = ({ broadcast }: { broadcast: Broadcast }) => {
  const { t } = useTranslation('broadcasts');
  const [status, setStatus] = useState<Recipient['status'] | null>(null);
  const [q, setQ] = useState('');
  const search = useDeferredValue(q.trim());
  const email = broadcast.channel === 'email';

  const list = useInfiniteQuery(
    orpc.broadcasts.recipients.infiniteOptions({
      ...forwardPaging(50),
      input: (page) => ({
        ...page,
        id: broadcast.id,
        status: status ?? undefined,
        search: search || undefined,
      }),
      select: flattenPages,
      refetchInterval: broadcast.status === 'sending' ? 5000 : false,
    }),
  );

  return (
    <section className="min-w-0 space-y-3">
      <SearchBar value={q} onChange={setQ} label={t('recipients-search', 'Search name or address')}>
        <OptionSelect
          label={t('status-filter', 'Status')}
          value={status}
          options={BroadcastRecipientStatus.options}
          onChange={setStatus}
          text={(option) => t(`recipient-status.${option}`, option)}
        />
      </SearchBar>
      <QueryState
        query={list}
        className="py-12"
        isEmpty={({ rows }) => !rows.length}
        empty={<EmptyList />}
      >
        {({ rows }) => (
          <div className="overflow-hidden rounded-lg border bg-background">
            <table className="w-full text-sm">
              <Head email={email} />
              <tbody className="divide-y">
                {rows.map((row) => (
                  <RecipientRow key={row.id} row={row} email={email} />
                ))}
              </tbody>
            </table>
            <LoadMore query={list} />
          </div>
        )}
      </QueryState>
    </section>
  );
};
