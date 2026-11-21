import type { ExchangeRate } from '@erxes/core-contract';
import {
  IconArrowsExchange,
  IconCalendar,
  IconCoin,
  IconCurrencyDollar,
  IconEdit,
  IconTrash,
} from '@tabler/icons-react';
import type { RecordTableColumnDef } from 'erxes-ui';
import {
  Badge,
  Button,
  Combobox,
  Command,
  Popover,
  RecordTable,
  RecordTableInlineCell,
  TextOverflowTooltip,
} from 'erxes-ui';
import type { TFunction } from 'i18next';
import { useState } from 'react';

/** What a row's menu and date do: open the rate, or delete it. */
export interface RateActions {
  canManage: boolean;
  onEdit: (rate: ExchangeRate) => void;
  onRemove: (ids: string[], onDone?: () => void) => void;
}

const MoreCell = ({
  rate,
  actions,
  t,
}: {
  rate: ExchangeRate;
  actions: RateActions;
  t: TFunction;
}) => {
  const [open, setOpen] = useState(false);

  if (!actions.canManage) return null;

  const pick = (action: () => void) => () => {
    setOpen(false);
    action();
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Popover.Trigger render={<RecordTable.MoreButton className="h-full w-full" />} />
      <Combobox.Content>
        <Command shouldFilter={false}>
          <Command.List>
            <Command.Item value="edit" onSelect={pick(() => actions.onEdit(rate))}>
              <IconEdit /> {t('edit', 'Edit')}
            </Command.Item>
            <Command.Item value="delete" onSelect={pick(() => actions.onRemove([rate.id]))}>
              <IconTrash /> {t('delete', 'Delete')}
            </Command.Item>
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};

const CurrencyCell = ({ value }: { value: string }) => (
  <RecordTableInlineCell>
    <Badge variant="secondary">{value}</Badge>
  </RecordTableInlineCell>
);

/** 3.x's columns: the start date (which opens the rate), both currencies and the rate. */
export const exchangeRateColumns = (
  t: TFunction,
  actions: RateActions,
): RecordTableColumnDef<ExchangeRate>[] => [
  {
    id: 'more',
    cell: ({ row }) => <MoreCell rate={row.original} actions={actions} t={t} />,
    size: 33,
  },
  RecordTable.checkboxColumnOf<ExchangeRate>(),
  {
    id: 'date',
    accessorKey: 'date',
    header: () => <RecordTable.InlineHead label={t('date', 'Date')} icon={IconCalendar} />,
    cell: ({ row }) =>
      actions.canManage ? (
        <Button
          variant="cell"
          className="h-full w-full justify-start"
          onClick={() => actions.onEdit(row.original)}
        >
          {row.original.date}
        </Button>
      ) : (
        <RecordTableInlineCell>{row.original.date}</RecordTableInlineCell>
      ),
    size: 200,
  },
  {
    id: 'mainCurrency',
    accessorKey: 'mainCurrency',
    header: () => (
      <RecordTable.InlineHead label={t('main-currency', 'Main Currency')} icon={IconCoin} />
    ),
    cell: ({ row }) => <CurrencyCell value={row.original.mainCurrency} />,
    size: 200,
  },
  {
    id: 'rateCurrency',
    accessorKey: 'rateCurrency',
    header: () => (
      <RecordTable.InlineHead
        label={t('rate-currency', 'Rate Currency')}
        icon={IconCurrencyDollar}
      />
    ),
    cell: ({ row }) => <CurrencyCell value={row.original.rateCurrency} />,
    size: 200,
  },
  {
    id: 'rate',
    accessorKey: 'rate',
    header: () => <RecordTable.InlineHead label={t('rate', 'Rate')} icon={IconArrowsExchange} />,
    cell: ({ row }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={String(row.original.rate)} />
      </RecordTableInlineCell>
    ),
    size: 150,
  },
];
