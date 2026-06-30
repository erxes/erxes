import { useQuery } from '@apollo/client';
import { IconCashRegister } from '@tabler/icons-react';
import {
  Combobox,
  Command,
  Filter,
  Popover,
  useFilterContext,
  useQueryState,
} from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ACCOUNTING_POS_LIST_QUERY } from '../graphql/checkSyncedOrders';

type AccountingPos = {
  _id: string;
  name?: string;
};

type AccountingPosListQueryResult = {
  posList?: AccountingPos[];
};

const getPosLabel = (pos?: AccountingPos) =>
  pos?.name || pos?._id || 'Select POS';

const useAccountingPosList = () =>
  useQuery<AccountingPosListQueryResult>(ACCOUNTING_POS_LIST_QUERY, {
    variables: {
      page: 1,
      perPage: 50,
    },
  });

const AccountingOrderPosContent = ({ onSelect }: { onSelect?: () => void }) => {
  const { t } = useTranslation('accounting');
  const [posId, setPosId] = useQueryState<string>('pos');
  const { data, loading } = useAccountingPosList();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-24">
        <span className="text-muted-foreground">{t('loading')}</span>
      </div>
    );
  }

  return (
    <Command>
      <Command.Input placeholder={t('search-pos')} />
      <Command.Empty>
        <span className="text-muted-foreground">{t('no-pos-found')}</span>
      </Command.Empty>
      <Command.List>
        {(data?.posList || []).map((pos) => (
          <Command.Item
            key={pos._id}
            value={pos._id}
            onSelect={() => {
              setPosId(pos._id);
              onSelect?.();
            }}
          >
            <span className="font-medium">{getPosLabel(pos)}</span>
            <Combobox.Check checked={posId === pos._id} />
          </Command.Item>
        ))}
      </Command.List>
    </Command>
  );
};

export const AccountingOrderPosFilterItem = () => {
  const { t } = useTranslation('accounting');
  return (
    <Filter.Item value="pos">
      <IconCashRegister />
      {t('pos')}
    </Filter.Item>
  );
};


export const AccountingOrderPosFilterView = () => {
  const { resetFilterState } = useFilterContext();

  return (
    <Filter.View filterKey="pos">
      <AccountingOrderPosContent onSelect={resetFilterState} />
    </Filter.View>
  );
};

export const AccountingOrderPosFilterBar = () => {
  const { t } = useTranslation('accounting');
  const [open, setOpen] = useState(false);
  const [posId] = useQueryState<string>('pos');
  const { data } = useAccountingPosList();
  const pos = data?.posList?.find((item) => item._id === posId);

  return (
    <Filter.BarItem queryKey="pos">
      <Filter.BarName>
        <IconCashRegister />
        {t('pos')}
      </Filter.BarName>
      <Popover open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <Filter.BarButton filterKey="pos">
            {getPosLabel(pos)}
          </Filter.BarButton>
        </Popover.Trigger>
        <Combobox.Content>
          <AccountingOrderPosContent onSelect={() => setOpen(false)} />
        </Combobox.Content>
      </Popover>
    </Filter.BarItem>
  );
};
