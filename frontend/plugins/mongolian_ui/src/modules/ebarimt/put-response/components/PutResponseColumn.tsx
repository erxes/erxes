import {
  IconCategory,
  IconCurrencyDollar,
  IconHash,
  IconLabel,
  IconUser,
} from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/table-core';
import {
  Badge,
  TextOverflowTooltip,
  RecordTableInlineCell,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { MembersInline } from 'ui-modules';
import { IPutResponse } from '~/modules/ebarimt/put-response/types/PutResponseType';
import { putResponseMoreColumn } from '~/modules/ebarimt/put-response/components/PutResponseMoreColumn';
import {
  getDisplayDate,
  getPutResponseStatus,
} from '~/modules/ebarimt/put-response/utils/putResponsePrint';
import { HeaderCell } from '~/modules/ebarimt/put-response/components/HeaderCell';

const PutResponseStatusCell = ({
  putResponse,
}: {
  putResponse: IPutResponse;
}) => {
  const { t } = useTranslation('mongolian');
  const { variant, label } = getPutResponseStatus(putResponse);

  return (
    <RecordTableInlineCell>
      <Badge variant={variant}>{t(label)}</Badge>
    </RecordTableInlineCell>
  );
};

export const putResponseColumns = (timeZone: string): ColumnDef<IPutResponse>[] => [
  putResponseMoreColumn(timeZone),
  {
    id: 'id',
    accessorKey: 'id',
    header: () => <HeaderCell icon={IconHash} label="bill-id" />,
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={cell.getValue() as string} />
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'billId',
    accessorKey: 'billId',
    header: () => <HeaderCell icon={IconLabel} label="sub-bill-ids" />,
    cell: ({ row }) => {
      const receipts = row.original.receipts;
      const receiptId = receipts?.[0]?.id || '-';
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={receiptId} />
        </RecordTableInlineCell>
      );
    },
  },

  {
    id: 'number',
    accessorKey: 'number',
    header: () => <HeaderCell icon={IconCurrencyDollar} label="number" />,
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={cell.getValue() as string} />
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'date',
    accessorKey: 'date',
    header: () => <HeaderCell icon={IconUser} label="date" />,
    cell: ({ row }) => {
      const displayDate = getDisplayDate(row.original, timeZone);

      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={displayDate} />
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: () => <HeaderCell icon={IconCategory} label="status" />,
    cell: ({ row }) => <PutResponseStatusCell putResponse={row.original} />,
  },
  {
    id: 'type',
    accessorKey: 'type',
    header: () => <HeaderCell icon={IconCategory} label="bill-type" />,
    cell: ({ row }) => {
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={row.original.type} />
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'receipts',
    accessorKey: 'receipts',
    header: () => <HeaderCell icon={IconCategory} label="receipts" />,
    cell: ({ row }) => {
      const receipts = row.original.receipts;
      if (!receipts || !Array.isArray(receipts) || receipts.length === 0) {
        return (
          <RecordTableInlineCell>
            <TextOverflowTooltip value="-" />
          </RecordTableInlineCell>
        );
      }

      const firstReceipt = receipts[0];
      const items = firstReceipt?.items;

      if (!items || !Array.isArray(items) || items.length === 0) {
        return (
          <RecordTableInlineCell>
            <TextOverflowTooltip value="-" />
          </RecordTableInlineCell>
        );
      }

      const quantity = items[0]?.qty;
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={String(quantity || '')} />
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'totalAmount',
    accessorKey: 'totalAmount',
    header: () => <HeaderCell icon={IconCategory} label="amount" />,
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={cell.getValue() as string} />
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'message',
    accessorKey: 'message',
    header: () => <HeaderCell icon={IconCategory} label="message" />,
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={cell.getValue() as string} />
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'inactiveId',
    accessorKey: 'inactiveId',
    header: () => <HeaderCell icon={IconCategory} label="inactive-id" />,
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={cell.getValue() as string} />
        </RecordTableInlineCell>
      );
    },
  },

  {
    id: 'user',
    accessorKey: 'userId',
    header: () => <HeaderCell icon={IconUser} label="user" />,
    cell: ({ row }) => (
      <RecordTableInlineCell>
        {row.original.userId ? (
          <MembersInline memberIds={[row.original.userId]} />
        ) : (
          <TextOverflowTooltip value="-" />
        )}
      </RecordTableInlineCell>
    ),
  },
];
