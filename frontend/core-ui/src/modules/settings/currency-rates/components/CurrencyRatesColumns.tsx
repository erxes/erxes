import {
  IconArrowsExchange,
  IconCalendar,
  IconCalendarPlus,
  IconCoin,
  IconDatabase,
  IconEdit,
  IconTrash,
  IconUser,
} from '@tabler/icons-react';
import { Cell, ColumnDef } from '@tanstack/react-table';
import dayjs from 'dayjs';
import {
  Badge,
  Combobox,
  Command,
  Popover,
  RecordTable,
  RecordTableInlineCell,
  RelativeDateDisplay,
} from 'erxes-ui';
import { useSetAtom } from 'jotai';
import { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import { Can, MembersInline } from 'ui-modules';
import { useCurrencyRatesRemove } from '../hooks/useCurrencyRateMutations';
import { currencyRateSheetAtom } from '../state';
import { CURRENCY_RATE_MANUAL_SOURCE, ICurrencyRate } from '../types';

const MoreCell = ({ cell }: { cell: Cell<ICurrencyRate, unknown> }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'currency-rates' });
  const rate = cell.row.original;
  const setSheet = useSetAtom(currencyRateSheetAtom);
  const { remove } = useCurrencyRatesRemove();

  // provider rates are refreshed by their plugin, never by hand
  if (rate.source !== CURRENCY_RATE_MANUAL_SOURCE) {
    return null;
  }

  return (
    <Popover>
      <Can action="exchangeRatesManage">
        <Popover.Trigger asChild>
          <RecordTable.MoreButton className="w-full h-full" />
        </Popover.Trigger>
      </Can>
      <Combobox.Content>
        <Command shouldFilter={false}>
          <Command.List>
            <Command.Item value="edit" onSelect={() => setSheet(rate)}>
              <IconEdit /> {t('edit', 'Edit')}
            </Command.Item>
            <Command.Item
              value="delete"
              className="text-destructive"
              onSelect={() => remove([rate._id])}
            >
              <IconTrash /> {t('delete', 'Delete')}
            </Command.Item>
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};

const DateCell = ({ cell }: { cell: Cell<ICurrencyRate, unknown> }) => {
  const rate = cell.row.original;
  const setSheet = useSetAtom(currencyRateSheetAtom);
  const editable = rate.source === CURRENCY_RATE_MANUAL_SOURCE;

  return (
    <RecordTableInlineCell
      className={editable ? 'cursor-pointer font-medium' : 'font-medium'}
      onClick={() => editable && setSheet(rate)}
    >
      {dayjs(rate.date).format('YYYY-MM-DD')}
    </RecordTableInlineCell>
  );
};

export const currencyRatesColumns = (
  t: TFunction,
): ColumnDef<ICurrencyRate>[] => [
  { id: 'more', cell: MoreCell, size: 33 },
  RecordTable.checkboxColumn as ColumnDef<ICurrencyRate>,
  {
    id: 'date',
    accessorKey: 'date',
    header: () => (
      <RecordTable.InlineHead label={t('date', 'Date')} icon={IconCalendar} />
    ),
    cell: ({ cell }) => <DateCell cell={cell} />,
    size: 140,
  },
  {
    id: 'rateCurrency',
    accessorKey: 'rateCurrency',
    header: () => (
      <RecordTable.InlineHead
        label={t('currency', 'Currency')}
        icon={IconCoin}
      />
    ),
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <Badge variant="secondary">{cell.row.original.rateCurrency}</Badge>
      </RecordTableInlineCell>
    ),
    size: 120,
  },
  {
    id: 'rate',
    accessorKey: 'rate',
    header: () => (
      <RecordTable.InlineHead
        label={t('rate', 'Rate')}
        icon={IconArrowsExchange}
      />
    ),
    cell: ({ cell }) => {
      const { rate, rateCurrency, mainCurrency } = cell.row.original;

      return (
        <RecordTableInlineCell className="tabular-nums">
          <span className="text-muted-foreground">1 {rateCurrency} =</span>{' '}
          {rate.toLocaleString(undefined, { maximumFractionDigits: 4 })}{' '}
          {mainCurrency}
        </RecordTableInlineCell>
      );
    },
    size: 220,
  },
  {
    id: 'source',
    accessorKey: 'source',
    header: () => (
      <RecordTable.InlineHead
        label={t('source', 'Source')}
        icon={IconDatabase}
      />
    ),
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <Badge variant="secondary">
          {cell.row.original.source === CURRENCY_RATE_MANUAL_SOURCE
            ? t('manual', 'Manual')
            : cell.row.original.source}
        </Badge>
      </RecordTableInlineCell>
    ),
    size: 140,
  },
  {
    id: 'createdBy',
    accessorKey: 'createdBy',
    header: () => (
      <RecordTable.InlineHead
        label={t('created-by', 'Created by')}
        icon={IconUser}
      />
    ),
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        {cell.row.original.createdBy && (
          <MembersInline memberIds={[cell.row.original.createdBy]} />
        )}
      </RecordTableInlineCell>
    ),
    size: 200,
  },
  {
    id: 'createdAt',
    accessorKey: 'createdAt',
    header: () => (
      <RecordTable.InlineHead
        label={t('created-at', 'Created at')}
        icon={IconCalendarPlus}
      />
    ),
    cell: ({ cell }) => (
      <RelativeDateDisplay value={cell.row.original.createdAt} asChild>
        <RecordTableInlineCell>
          <RelativeDateDisplay.Value value={cell.row.original.createdAt} />
        </RecordTableInlineCell>
      </RelativeDateDisplay>
    ),
  },
];
