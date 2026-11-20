import { type EmailAddressStanding, EmailLane } from '@erxes/core-contract';
import { messageOf, orpc } from '@erxes/core-contract/client';
import { IconAddressBook } from '@tabler/icons-react';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Badge, Button, Empty, Spinner, useConfirm, useFormat, useToast } from 'erxes-ui';
import { useDeferredValue, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { QueryState } from '~/components/QueryState';
import { forwardPaging } from '~/lib/cursorList';
import { useCan } from '~/modules/auth/session';
import {
  flattenPages,
  LoadMore,
  OptionSelect,
  SearchBar,
} from '~/modules/broadcasts/BroadcastBits';

const LANE_VARIANT = {
  proven: 'success',
  unknown: 'warning',
  suppressed: 'destructive',
} as const satisfies Record<EmailAddressStanding['lane'], string>;

/** A member can lift a bounce or a member's entry; an unsubscribe or a complaint was the person's own word. */
const reopenable = (row: EmailAddressStanding) =>
  row.suppressionReason === 'bounced' || row.suppressionReason === 'manual';

/** Lifts the address's suppression (the suppression list's own remove, audited). */
const useReopen = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.email.addresses' });
  const { confirm } = useConfirm();
  const { toast } = useToast();
  const client = useQueryClient();

  const remove = useMutation(
    orpc.suppressions.remove.mutationOptions({
      onSuccess: () => {
        toast({ title: t('reopened', 'Reopened') });

        return Promise.all([
          client.invalidateQueries({ queryKey: orpc.emails.key() }),
          client.invalidateQueries({ queryKey: orpc.suppressions.key() }),
        ]);
      },
      onError: (error) =>
        toast({
          variant: 'destructive',
          title: t('reopen-failed', 'Could not reopen'),
          description: messageOf(error),
        }),
    }),
  );

  const reopen = (row: EmailAddressStanding) => {
    const id = row.suppressionId;

    if (!id) return;

    void confirm({
      message: t('reopen-confirm', 'Let every email reach {{address}} again?', {
        address: row.email,
      }),
      options: { okLabel: t('reopen', 'Reopen') },
    }).then(() => remove.mutate({ id }));
  };

  return { reopen, pending: remove.isPending };
};

/** Proven, unknown, or suppressed with its reason. */
const LaneBadge = ({ row }: { row: EmailAddressStanding }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.email' });
  const lane = t(`addresses.lane.${row.lane}`, row.lane);

  return (
    <Badge variant={LANE_VARIANT[row.lane]} size="sm">
      {row.suppressionReason
        ? `${lane} · ${t(`deliveries.reason.${row.suppressionReason}`, row.suppressionReason)}`
        : lane}
    </Badge>
  );
};

/** Sends, deliveries, soft bounces and when it was closed, on one line. */
const useCounts = (row: EmailAddressStanding) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.email.addresses' });
  const fmt = useFormat();

  return [
    row.lastSentAt && t('last-sent', 'Last sent {{date}}', { date: fmt.dateTime(row.lastSentAt) }),
    row.sentCount > 0 && t('sent', '{{count}} sent', { count: row.sentCount }),
    row.lastDeliveredAt
      ? t('last-delivered', 'Last delivered {{date}}', { date: fmt.dateTime(row.lastDeliveredAt) })
      : t('never-delivered', 'Never delivered'),
    row.deliveredCount > 0 && t('delivered', '{{count}} delivered', { count: row.deliveredCount }),
    row.softBounces > 0 && t('soft-bounces', '{{count}} soft bounces', { count: row.softBounces }),
    row.suppressedAt && t('closed', 'Closed {{date}}', { date: fmt.dateTime(row.suppressedAt) }),
  ]
    .filter(Boolean)
    .join(' · ');
};

const AddressRow = ({
  row,
  canReopen,
  onReopen,
  pending,
}: {
  row: EmailAddressStanding;
  canReopen: boolean;
  onReopen: (row: EmailAddressStanding) => void;
  pending: boolean;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.email.addresses' });
  const counts = useCounts(row);

  return (
    <li className="flex items-center gap-3 px-4 py-3">
      <div className="min-w-0 flex-1 space-y-0.5">
        <p className="truncate text-sm font-medium">{row.email}</p>
        <p className="truncate text-xs text-muted-foreground">{counts}</p>
        {row.suppressionDetail && (
          <p className="text-xs break-words text-muted-foreground">{row.suppressionDetail}</p>
        )}
      </div>
      <LaneBadge row={row} />
      {canReopen && reopenable(row) && (
        <Button variant="secondary" size="sm" disabled={pending} onClick={() => onReopen(row)}>
          {pending ? <Spinner size="sm" /> : t('reopen', 'Reopen')}
        </Button>
      )}
    </li>
  );
};

const NoAddresses = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.email.addresses' });

  return (
    <Empty>
      <Empty.Header>
        <Empty.Media variant="icon">
          <IconAddressBook />
        </Empty.Media>
        <Empty.Title>{t('empty', 'No addresses yet')}</Empty.Title>
        <Empty.Description>
          {t(
            'empty-description',
            'An address shows here once an email goes to it, or once it is suppressed.',
          )}
        </Empty.Description>
      </Empty.Header>
    </Empty>
  );
};

/** The list with its filters: standing and part of the address. */
const useAddressList = () => {
  const [lane, setLane] = useState<EmailAddressStanding['lane'] | null>(null);
  const [q, setQ] = useState('');
  const search = useDeferredValue(q.trim());

  const list = useInfiniteQuery(
    orpc.emails.addresses.infiniteOptions({
      ...forwardPaging(50),
      input: (page) => ({ ...page, lane: lane ?? undefined, search: search || undefined }),
      select: flattenPages,
    }),
  );

  return { list, lane, setLane, q, setQ };
};

/**
 * Each address's standing: proven by a delivery the provider reported lately,
 * unknown, or suppressed and why; a bounce or a member's entry can be reopened.
 */
export const EmailAddressesTab = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.email.addresses' });
  const { list, lane, setLane, q, setQ } = useAddressList();
  const { reopen, pending } = useReopen();
  // Lifting a suppression is the suppression list's own action.
  const canReopen = useCan()('broadcasts.manage');

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        {t(
          'intro',
          'Proven: your provider delivered to it in the last 180 days. Unknown: no recent delivery. Suppressed: it gets no email (an unsubscribe stops only broadcasts).',
        )}
      </p>
      <SearchBar value={q} onChange={setQ} label={t('search', 'Search addresses')}>
        <OptionSelect
          label={t('lane-filter', 'Standing')}
          value={lane}
          options={EmailLane.options}
          onChange={setLane}
          text={(option) => t(`lane.${option}`, option)}
        />
      </SearchBar>
      <QueryState
        query={list}
        className="py-12"
        isEmpty={({ rows }) => !rows.length}
        empty={<NoAddresses />}
      >
        {({ rows }) => (
          <div className="overflow-hidden rounded-lg border">
            <ul className="divide-y">
              {rows.map((row) => (
                <AddressRow
                  key={row.id}
                  row={row}
                  canReopen={canReopen}
                  onReopen={reopen}
                  pending={pending}
                />
              ))}
            </ul>
            <LoadMore query={list} />
          </div>
        )}
      </QueryState>
    </div>
  );
};
