import { IconEdit, IconTrash } from '@tabler/icons-react';
import { Cell } from '@tanstack/react-table';
import {
  Combobox,
  Command,
  Popover,
  RecordTable,
  useQueryState,
} from 'erxes-ui';
import { useSetAtom } from 'jotai';
import { EXCHANGE_RATE_ID_QUERY_KEY } from '../constants';
import { exchangeRateDetailAtom } from '../states/exchangeRatesStates';
import { IExchangeRate } from '../types';
import { useRemoveExchangeRates } from '../hooks/useRemoveExchangeRates';

export const ExchangeRatesMoreColumnCell = ({
  cell,
}: {
  cell: Cell<IExchangeRate, unknown>;
}) => {
  const [, setOpenId] = useQueryState(EXCHANGE_RATE_ID_QUERY_KEY);
  const setDetail = useSetAtom(exchangeRateDetailAtom);
  const { remove } = useRemoveExchangeRates();

  const handleEdit = () => {
    setDetail(cell.row.original);
    setOpenId(cell.row.original._id ?? null);
  };

  const handleDelete = () => {
    const id = cell.row.original._id;
    if (id) remove([id]);
  };

  return (
    <Popover>
      <Popover.Trigger asChild>
        <RecordTable.MoreButton className="h-full w-full" />
      </Popover.Trigger>
      <Combobox.Content>
        <Command shouldFilter={false}>
          <Command.List>
            <Command.Item value="edit" onSelect={handleEdit}>
              <IconEdit /> Edit
            </Command.Item>
            <Command.Item value="delete" onSelect={handleDelete}>
              <IconTrash /> Delete
            </Command.Item>
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};

export const exchangeRatesMoreColumn = {
  id: 'more',
  cell: ExchangeRatesMoreColumnCell,
  size: 24,
  minSize: 24,
};
