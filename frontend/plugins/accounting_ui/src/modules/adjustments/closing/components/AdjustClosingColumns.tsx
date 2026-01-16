import { ColumnDef } from '@tanstack/table-core';
import { IAdjustClosing } from '../types/AdjustClosing';
import {
  Input,
  Popover,
  PopoverScoped,
  RecordTable,
  RecordTableInlineCell,
  useQueryState,
} from 'erxes-ui';
import {
  IconBuildingBank,
  IconCalendar,
  IconFile,
  IconFlag,
} from '@tabler/icons-react';
import dayjs from 'dayjs';
import { useState } from 'react';
import { renderingAdjustClosingDetailAtom } from '../types/adjustClosingDetailStates';
import { useSetAtom } from 'jotai';
import { AdjustClosingEntryDetail } from './AdjustClosingDetail';
import { AdjustClosingDetailSheet } from './AdjustClosingDetailSheet';
import { useTranslation } from 'react-i18next';

const StatusCell = ({ row }: { row: any }) => {
  const [, setDetailOpen] = useQueryState('_id');
  const setRenderingDetail = useSetAtom(renderingAdjustClosingDetailAtom);

  const { t } = useTranslation('adjust', {
    keyPrefix: 'Adjust Closing',
  });

  const { _id, status } = row.original;

  return (
    <Popover>
      <Popover.Trigger asChild>
        <RecordTableInlineCell.Anchor
          onClick={() => {
            setDetailOpen(_id);
            setRenderingDetail(false);
          }}
        >
          {status}
        </RecordTableInlineCell.Anchor>
      </Popover.Trigger>
      <Popover.Content>
        <AdjustClosingDetailSheet queryKey="_id" title={t('Entry detail')}>
          <AdjustClosingEntryDetail />
        </AdjustClosingDetailSheet>
      </Popover.Content>
    </Popover>
  );
};

const DescriptionCell = ({ getValue, row }: any) => {
  const [description, setDescription] = useState(getValue() as string);
  const _id = row?.original?._id;

  return (
    <PopoverScoped scope={`transaction-${_id}-description`}>
      <RecordTableInlineCell.Trigger>
        {getValue() as string}
      </RecordTableInlineCell.Trigger>
      <RecordTableInlineCell.Content>
        <Input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </RecordTableInlineCell.Content>
    </PopoverScoped>
  );
};

const DateCell = ({ getValue }: any) => {
  const date = getValue();
  return (
    <RecordTableInlineCell>
      {date ? dayjs(date).format('YYYY-MM-DD') : '-'}
    </RecordTableInlineCell>
  );
};

const TextCell = ({ getValue }: any) => {
  const value = getValue();
  return <RecordTableInlineCell>{value || '-'}</RecordTableInlineCell>;
};

const checkBoxColumn = RecordTable.checkboxColumn as ColumnDef<IAdjustClosing>;

export const adjustClosingTableColumns: ColumnDef<IAdjustClosing>[] = [
  checkBoxColumn,
  {
    id: 'status',
    accessorKey: 'status',
    header: () => <RecordTable.InlineHead icon={IconFlag} label="Status" />,
    cell: ({ cell }) => <StatusCell row={cell.row} />,
    size: 100,
  },
  {
    id: 'date',
    header: () => <RecordTable.InlineHead icon={IconCalendar} label="Date" />,
    accessorKey: 'date',
    cell: ({ getValue, row }) => <DateCell getValue={getValue} row={row} />,
  },
  {
    id: 'beginDate',
    header: () => (
      <RecordTable.InlineHead icon={IconCalendar} label="Begin date" />
    ),
    accessorKey: 'beginDate',
    cell: ({ getValue }) => <DateCell getValue={getValue} />,
  },
  {
    id: 'description',
    header: () => (
      <RecordTable.InlineHead icon={IconFile} label="Description" />
    ),
    accessorKey: 'description',
    cell: ({ getValue, row }) => (
      <DescriptionCell getValue={getValue} row={row} />
    ),
  },
  {
    id: 'integrateAccountId',
    header: () => (
      <RecordTable.InlineHead
        icon={IconBuildingBank}
        label="Integrate account"
      />
    ),
    accessorKey: 'integrateAccountId',
    cell: ({ getValue }) => <TextCell getValue={getValue} />,
  },

  {
    id: 'periodGLAccountId',
    header: () => (
      <RecordTable.InlineHead
        icon={IconBuildingBank}
        label="Period GL account"
      />
    ),
    accessorKey: 'periodGLAccountId',
    cell: ({ getValue }) => <TextCell getValue={getValue} />,
  },

  {
    id: 'earningAccountId',
    header: () => (
      <RecordTable.InlineHead icon={IconBuildingBank} label="Earning account" />
    ),
    accessorKey: 'earningAccountId',
    cell: ({ getValue }) => <TextCell getValue={getValue} />,
  },

  {
    id: 'taxPayableAccountId',
    header: () => (
      <RecordTable.InlineHead
        icon={IconBuildingBank}
        label="Tax payable account"
      />
    ),
    accessorKey: 'taxPayableAccountId',
    cell: ({ getValue }) => <TextCell getValue={getValue} />,
  },
];
