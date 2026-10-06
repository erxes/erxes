import { HeaderCell } from '@/check-synced/constants/HeaderCell';
import {
  CurrencyCode,
  CurrencyFormatedDisplay,
  RecordTable,
  RecordTableInlineCell,
} from 'erxes-ui';
import { Cell, ColumnDef } from '@tanstack/table-core';
import { Link } from 'react-router-dom';
import { IconLink, IconMoneybag, IconPercentage } from '@tabler/icons-react';

export type IClosingDetailEntryRow = {
  _id: string;

  accountId: string;
  balance?: number;
  percent?: number;

  mainAccTrId?: string;
  integrateTrId?: string;

  branchId?: string;
  departmentId?: string;
};

const MoneyCell = ({ getValue }: any) => {
  const value = getValue() as number | undefined;

  return (
    <RecordTableInlineCell>
      <CurrencyFormatedDisplay
        currencyValue={{
          currencyCode: CurrencyCode.MNT,
          amountMicros: value ?? 0,
        }}
      />
    </RecordTableInlineCell>
  );
};

const TextCell = ({ getValue }: any) => {
  return (
    <RecordTableInlineCell>{String(getValue() ?? '')}</RecordTableInlineCell>
  );
};

const ClosingMoreColumnCell = ({
  cell,
}: {
  cell: Cell<IClosingDetailEntryRow, unknown>;
}) => {
  const { _id } = cell.row.original;

  return (
    <Link to={`/accounting/adjustment/closing/${_id}`}>
      <RecordTable.MoreButton className="w-full h-full" />
    </Link>
  );
};

const closingMoreColumn: ColumnDef<IClosingDetailEntryRow> = {
  id: 'more',
  cell: ClosingMoreColumnCell,
  size: 33,
};

export const adjustClosingDetailTableColumns: ColumnDef<IClosingDetailEntryRow>[] =
  [
    closingMoreColumn,
    {
      id: 'accountId',
      header: () => <HeaderCell icon={IconMoneybag} labelKey="account" />,
      accessorKey: 'accountId',
      cell: ({ getValue }) => <TextCell getValue={getValue} />,
      size: 260,
    },
    {
      id: 'balance',
      header: () => <HeaderCell icon={IconMoneybag} labelKey="remainder" />,
      accessorKey: 'balance',
      cell: ({ getValue }) => <MoneyCell getValue={getValue} />,
      size: 160,
    },
    {
      id: 'percent',
      header: () => <HeaderCell icon={IconPercentage} labelKey="percentage" />,
      accessorKey: 'percent',
      cell: ({ getValue }) => <TextCell getValue={getValue} />,
      size: 120,
    },
    {
      id: 'mainAccTrId',
      header: () => (
        <HeaderCell icon={IconLink} labelKey="primary-transaction" />
      ),
      accessorKey: 'mainAccTrId',
      cell: ({ getValue }) => <TextCell getValue={getValue} />,
      size: 220,
    },
    {
      id: 'integrateTrId',
      header: () => (
        <HeaderCell icon={IconLink} labelKey="closing-transaction" />
      ),
      accessorKey: 'integrateTrId',
      cell: ({ getValue }) => <TextCell getValue={getValue} />,
      size: 220,
    },
  ];
