import type { ApiKey } from '@erxes/core-contract';
import { memberQueries, messageOf, orpc } from '@erxes/core-contract/client';
import {
  IconCalendarPlus,
  IconCategory,
  IconClock,
  IconHourglass,
  IconKey,
  IconShieldCheck,
  IconTrash,
  IconUser,
} from '@tabler/icons-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { RecordTableColumnDef } from 'erxes-ui';
import {
  Badge,
  Button,
  MemberLink,
  RecordTable,
  RecordTableInlineCell,
  RelativeDateDisplay,
  useConfirm,
  useToast,
} from 'erxes-ui';
import type { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import { useMinuteClock } from '~/lib/useMinuteClock';
import { KeyAccessCell, KeyKindCell, KeyNameCell } from './keys/KeyCells';

const WEEK = 7 * 24 * 60 * 60 * 1000;

const RevokeCell = ({ apiKey }: { apiKey: ApiKey }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'api-keys' });
  const { toast } = useToast();
  const { confirm } = useConfirm();
  const client = useQueryClient();

  const remove = useMutation(
    orpc.apiKeys.remove.mutationOptions({
      onSuccess: () => client.invalidateQueries({ queryKey: orpc.apiKeys.list.key() }),
      onError: (failure) =>
        toast({
          variant: 'destructive',
          title: t('revoke-failed', 'Could not revoke the key'),
          description: messageOf(failure),
        }),
    }),
  );

  return (
    <Button
      variant="cell"
      size="icon"
      tone="muted"
      className="h-full w-full"
      aria-label={t('revoke', 'Revoke')}
      onClick={() =>
        void confirm({
          message: t('revoke-confirm', 'Revoke {{name}}? Whatever uses it stops working at once.', {
            name: apiKey.name,
          }),
          options: { okLabel: t('revoke', 'Revoke'), variants: { ok: 'destructive' } },
        }).then(() => remove.mutate({ id: apiKey.id }))
      }
    >
      <IconTrash className="size-4" />
    </Button>
  );
};

/** A date as how long ago (or until), or `empty` in muted text without one. */
const DateCell = ({ value, empty }: { value: string | null; empty: string }) =>
  value ? (
    <RelativeDateDisplay value={value} render={<RecordTableInlineCell variant="muted" />}>
      <RelativeDateDisplay.Value value={value} />
    </RelativeDateDisplay>
  ) : (
    <RecordTableInlineCell variant="muted">{empty}</RecordTableInlineCell>
  );

/** When the key stops working: a red badge once it has, amber within a week. */
const ExpiresCell = ({ expiresAt }: { expiresAt: string | null }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'api-keys' });
  const now = useMinuteClock();

  if (!expiresAt) {
    return <DateCell value={null} empty={t('never', 'Never')} />;
  }

  const left = Date.parse(expiresAt) - now;

  if (left > WEEK) {
    return <DateCell value={expiresAt} empty="" />;
  }

  return (
    <RecordTableInlineCell>
      <RelativeDateDisplay value={expiresAt}>
        <Badge variant={left <= 0 ? 'destructive' : 'warning'}>
          {left <= 0 ? t('expired', 'Expired') : <RelativeDateDisplay.Value value={expiresAt} />}
        </Badge>
      </RelativeDateDisplay>
    </RecordTableInlineCell>
  );
};

const revokeColumn: RecordTableColumnDef<ApiKey> = {
  id: 'more',
  header: () => null,
  cell: ({ row }) => <RevokeCell apiKey={row.original} />,
  size: 33,
};

/** The API key table's columns; managers see every member's keys, so also whose each one is. */
export const apiKeyColumns = (
  t: TFunction<'settings', 'api-keys'>,
  everyone: boolean,
): RecordTableColumnDef<ApiKey>[] => [
  revokeColumn,
  {
    id: 'name',
    accessorKey: 'name',
    header: () => <RecordTable.InlineHead icon={IconKey} label={t('name', 'Name')} />,
    cell: ({ row }) => <KeyNameCell apiKey={row.original} />,
    size: 220,
  },
  {
    id: 'kind',
    accessorKey: 'kind',
    header: () => <RecordTable.InlineHead icon={IconCategory} label={t('kind-head', 'Kind')} />,
    cell: ({ row }) => <KeyKindCell kind={row.original.kind} />,
    size: 130,
  },
  {
    id: 'access',
    header: () => (
      <RecordTable.InlineHead icon={IconShieldCheck} label={t('access', 'What it can do')} />
    ),
    cell: ({ row }) => <KeyAccessCell apiKey={row.original} />,
    size: 420,
  },
  ...(everyone
    ? [
        {
          id: 'member',
          accessorKey: 'userId',
          header: () => <RecordTable.InlineHead icon={IconUser} label={t('member', 'Member')} />,
          cell: ({ row }) => (
            <RecordTableInlineCell>
              <MemberLink memberId={row.original.userId} members={memberQueries} />
            </RecordTableInlineCell>
          ),
          size: 220,
        } satisfies RecordTableColumnDef<ApiKey>,
      ]
    : []),
  {
    id: 'lastUsedAt',
    accessorKey: 'lastUsedAt',
    header: () => <RecordTable.InlineHead icon={IconClock} label={t('last-used', 'Last used')} />,
    cell: ({ row }) => <DateCell value={row.original.lastUsedAt} empty={t('unused', 'Never')} />,
    size: 160,
  },
  {
    id: 'expiresAt',
    accessorKey: 'expiresAt',
    header: () => <RecordTable.InlineHead icon={IconHourglass} label={t('expires', 'Expires')} />,
    cell: ({ row }) => <ExpiresCell expiresAt={row.original.expiresAt} />,
    size: 160,
  },
  {
    id: 'createdAt',
    accessorKey: 'createdAt',
    header: () => (
      <RecordTable.InlineHead icon={IconCalendarPlus} label={t('created', 'Created')} />
    ),
    cell: ({ row }) => <DateCell value={row.original.createdAt} empty="" />,
    size: 160,
  },
];
