import {
  IconBuildingBank,
  IconCalendar,
  IconFile,
  IconFlag,
} from '@tabler/icons-react';
import { Cell, ColumnDef } from '@tanstack/react-table';
import dayjs from 'dayjs';
import {
  Input,
  PopoverScoped,
  RecordTable,
  RecordTableInlineCell,
} from 'erxes-ui';
import { TFunction } from 'i18next';
import { useSetAtom } from 'jotai';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { AccountsInline } from '~/modules/settings/account/components/AccountsInline';
import { renderingAdjustClosingDetailAtom } from '../types/adjustClosingDetailStates';
import { IAdjustClosing } from '../types/AdjustClosing';
import { AdjustClosingMoreColumn } from './AdjustClosingMoreColumn';

const StatusCell = ({ cell }: { cell: Cell<IAdjustClosing, unknown> }) => {
  const navigate = useNavigate();
  const setRenderingDetail = useSetAtom(renderingAdjustClosingDetailAtom);
  const { _id, status } = cell.row.original;

  return (
    <RecordTableInlineCell.Anchor
      onClick={() => {
        setRenderingDetail(false);
        navigate(`/accounting/adjustment/closing/${_id}`);
      }}
    >
      {status}
    </RecordTableInlineCell.Anchor>
  );
};

const DescriptionCell = ({ cell }: { cell: Cell<IAdjustClosing, unknown> }) => {
  const value = cell.getValue();
  const [description, setDescription] = useState(
    typeof value === 'string' ? value : '',
  );
  const _id = cell.row.original._id;

  return (
    <PopoverScoped scope={`transaction-${_id}-description`}>
      <RecordTableInlineCell.Trigger>
        {typeof value === 'string' && value ? value : '-'}
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

const DateCell = ({ cell }: { cell: Cell<IAdjustClosing, unknown> }) => {
  const date = cell.getValue();
  return (
    <RecordTableInlineCell>
      {date ? dayjs(date as Date).format('YYYY-MM-DD') : '-'}
    </RecordTableInlineCell>
  );
};

const AccountInlineCell = ({
  cell,
}: {
  cell: Cell<IAdjustClosing, unknown>;
}) => {
  const value = cell.getValue();
  const accountId = typeof value === 'string' ? value : undefined;

  return (
    <RecordTableInlineCell>
      <AccountsInline
        accountIds={accountId ? [accountId] : []}
        permissionMode="read"
        placeholder={accountId || '-'}
      />
    </RecordTableInlineCell>
  );
};

const checkBoxColumn = RecordTable.checkboxColumn as ColumnDef<IAdjustClosing>;

export const adjustClosingTableColumns: (
  t: TFunction,
) => ColumnDef<IAdjustClosing>[] = (t) => {
  return [
    AdjustClosingMoreColumn,
    checkBoxColumn,
    {
      id: 'status',
      accessorKey: 'status',
      header: () => <RecordTable.InlineHead icon={IconFlag} label="Status" />,
      cell: StatusCell,
      size: 120,
    },
    {
      id: 'date',
      header: () => (
        <RecordTable.InlineHead icon={IconCalendar} label={t('Date')} />
      ),
      accessorKey: 'date',
      cell: DateCell,
    },
    {
      id: 'beginDate',
      header: () => (
        <RecordTable.InlineHead icon={IconCalendar} label={t('Begin date')} />
      ),
      accessorKey: 'beginDate',
      cell: DateCell,
    },
    {
      id: 'description',
      header: () => (
        <RecordTable.InlineHead icon={IconFile} label={t('Description')} />
      ),
      accessorKey: 'description',
      cell: DescriptionCell,
    },
    {
      id: 'integrateAccountId',
      header: () => (
        <RecordTable.InlineHead
          icon={IconBuildingBank}
          label={t('Integrate account')}
        />
      ),
      accessorKey: 'integrateAccountId',
      cell: AccountInlineCell,
    },

    {
      id: 'periodGLAccountId',
      header: () => (
        <RecordTable.InlineHead
          icon={IconBuildingBank}
          label={t('Period GL account')}
        />
      ),
      accessorKey: 'periodGLAccountId',
      cell: AccountInlineCell,
    },

    {
      id: 'earningAccountId',
      header: () => (
        <RecordTable.InlineHead
          icon={IconBuildingBank}
          label={t('Earning account')}
        />
      ),
      accessorKey: 'earningAccountId',
      cell: AccountInlineCell,
    },

    {
      id: 'taxPayableAccountId',
      header: () => (
        <RecordTable.InlineHead
          icon={IconBuildingBank}
          label={t('Tax payable account')}
        />
      ),
      accessorKey: 'taxPayableAccountId',
      cell: AccountInlineCell,
    },
  ];
};
