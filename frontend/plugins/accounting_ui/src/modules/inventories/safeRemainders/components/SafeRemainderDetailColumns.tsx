import { Checkbox } from 'erxes-ui/components/checkbox';
import { IconMoneybag } from '@tabler/icons-react';
import { ColumnDef, Row } from '@tanstack/react-table';
import {
  CurrencyCode,
  CurrencyFormatedDisplay,
  INumberFieldContainerProps,
  ITextFieldContainerProps,
  NumberField,
  RecordTable,
  RecordTableInlineCell,
  RecordTableHotKeyControl,
} from 'erxes-ui';
import { useSafeRemainderItemEdit } from '../hooks/useSafeRemainderItemEdit';
import { ISafeRemainderItem } from '../types/SafeRemainder';
import { getSafeRemainderTransactionLabels } from '../utils/safeRemainderTransactions';
import { SafeRemainderUnitCostField } from './SafeRemainderUnitCostField';

const ProductCell = ({ row }: { row: Row<ISafeRemainderItem> }) => {
  return (
    <RecordTableInlineCell>
      {`${row.original.product?.code} - ${row.original.product?.name}`}
    </RecordTableInlineCell>
  );
};

const NumberCell = ({ value }: { value: number }) => {
  return (
    <RecordTableInlineCell>
      <CurrencyFormatedDisplay
        currencyValue={{
          currencyCode: CurrencyCode.MNT,
          amountMicros: value,
        }}
      />
    </RecordTableInlineCell>
  );
};

const RemainderField = ({
  value,
  _id,
  remItem,
}: INumberFieldContainerProps & { remItem: ISafeRemainderItem }) => {
  const { editRemItem } = useSafeRemainderItemEdit();

  return (
    <NumberField
      value={value}
      scope={`remItem-${_id}-count`}
      onSave={(value) => {
        editRemItem(
          {
            variables: { ...remItem, remainder: value, status: 'checked' },
          },
          ['count'],
        );
      }}
      className={'shadow-none rounded-none px-2'}
    />
  );
};

const DiffField = ({
  value,
  _id,
  remItem,
}: INumberFieldContainerProps & { remItem: ISafeRemainderItem }) => {
  const { editRemItem } = useSafeRemainderItemEdit();

  return (
    <NumberField
      value={value}
      scope={`remItem-${_id}-diff`}
      onSave={(value) => {
        editRemItem(
          {
            variables: {
              ...remItem,
              remainder: remItem.preCount + value,
              status: 'checked',
            },
          },
          ['count'],
        );
      }}
      className={'shadow-none rounded-none px-2'}
    />
  );
};

const StatusField = ({
  value,
  _id,
  remItem,
}: ITextFieldContainerProps & { remItem: ISafeRemainderItem }) => {
  const { editRemItem } = useSafeRemainderItemEdit();
  return (
    <div className="flex items-center justify-center">
      <Checkbox
        checked={value === 'checked'}
        onCheckedChange={(value) =>
          editRemItem(
            {
              variables: { ...remItem, status: value ? 'checked' : 'new' },
            },
            ['status'],
          )
        }
      />
    </div>
  );
};

export const safeRemDetailTableColumns: ColumnDef<ISafeRemainderItem>[] = [
  RecordTable.checkboxColumn as ColumnDef<ISafeRemainderItem>,
  {
    id: 'product',
    header: () => <RecordTable.InlineHead icon={IconMoneybag} label="Бараа" />,
    accessorKey: 'product',
    cell: ({ row }) => <ProductCell row={row} />,
    size: 300,
  },
  {
    id: 'preCount',
    header: () => (
      <RecordTable.InlineHead icon={IconMoneybag} label="Бодит үлдэгдэл" />
    ),
    accessorKey: 'preCount',
    cell: ({ row }) => <NumberCell value={row.original.preCount} />,
  },
  {
    id: 'uom',
    header: () => (
      <RecordTable.InlineHead icon={IconMoneybag} label="Хэмжих нэгж" />
    ),
    accessorKey: 'uom',
    cell: ({ row }) => (
      <RecordTableInlineCell>{row.original.uom ?? ''}</RecordTableInlineCell>
    ),
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: () => (
      <RecordTable.InlineHead icon={IconMoneybag} label="Тоолсон" />
    ),
    size: 33,
    cell: ({ row }) => (
      <RecordTableHotKeyControl
        rowId={row.original._id}
        rowIndex={row.index}
        colIndex={0}
      >
        <div>
          <StatusField
            value={row.original.status}
            field="status"
            _id={row.original._id}
            remItem={row.original}
          />
        </div>
      </RecordTableHotKeyControl>
    ),
  },
  {
    id: 'remainder',
    header: () => (
      <RecordTable.InlineHead icon={IconMoneybag} label="Үлдэгдэл" />
    ),
    accessorKey: 'remainder',
    cell: ({ row }) => (
      <RecordTableHotKeyControl
        rowId={row.original._id}
        rowIndex={row.index}
        colIndex={1}
      >
        <div>
          <RemainderField
            value={row.original.count ?? 0}
            field="count"
            _id={row.original._id}
            remItem={row.original}
          />
        </div>
      </RecordTableHotKeyControl>
    ),
  },
  {
    id: 'diff',
    header: () => <RecordTable.InlineHead icon={IconMoneybag} label="Зөрүү" />,
    accessorKey: 'diff',
    cell: ({ row }) => (
      <RecordTableHotKeyControl
        rowId={row.original._id}
        rowIndex={row.index}
        colIndex={2}
      >
        <div>
          <DiffField
            value={row.original.count - row.original.preCount}
            field="diff"
            _id={row.original._id}
            remItem={row.original}
          />
        </div>
      </RecordTableHotKeyControl>
    ),
  },
  {
    id: 'activeCost',
    header: () => (
      <RecordTable.InlineHead icon={IconMoneybag} label="Одоогийн өртөг" />
    ),
    cell: ({ row }) => (
      <NumberCell value={row.original.trInfo?.activeCost ?? 0} />
    ),
  },
  {
    id: 'unitCost',
    header: () => (
      <RecordTable.InlineHead icon={IconMoneybag} label="Тооллогын өртөг" />
    ),
    cell: ({ row }) => (
      <SafeRemainderUnitCostField
        value={
          row.original.trInfo?.unitCost ??
          row.original.trInfo?.activeCost ??
          0
        }
        field="trInfo.unitCost"
        _id={row.original._id}
        remItem={row.original}
      />
    ),
  },
  {
    id: 'transactions',
    header: () => (
      <RecordTable.InlineHead icon={IconMoneybag} label="Үүсэх гүйлгээ" />
    ),
    cell: ({ row }) => (
      <RecordTableInlineCell>
        {getSafeRemainderTransactionLabels(row.original).join(', ')}
      </RecordTableInlineCell>
    ),
    size: 220,
  },
];
