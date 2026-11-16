import { IconFlag } from '@tabler/icons-react';
import {
  Combobox,
  Command,
  Filter,
  useFilterContext,
  useQueryState,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { ADJUST_CLOSING_STATUSES } from '@/adjustments/closing/types/AdjustClosing';

const AdjustClosingStatusFilter = () => {
  const { t } = useTranslation('accounting');
  const [status, setStatus] = useQueryState<string>('status');
  const { resetFilterState } = useFilterContext();

  return (
    <Command>
      <Command.Input placeholder={t('status')} variant="secondary" />
      <Command.List>
        {ADJUST_CLOSING_STATUSES.map((value) => (
          <Command.Item
            key={value}
            value={t(value)}
            onSelect={() => {
              setStatus(status === value ? null : value);
              resetFilterState();
            }}
          >
            {t(value)}
            <Combobox.Check checked={status === value} />
          </Command.Item>
        ))}
      </Command.List>
    </Command>
  );
};

export const AdjustClosingFilter = () => {
  const { t } = useTranslation('accounting');
  const [status] = useQueryState<string>('status');

  return (
    <Filter id="adjust-closing-filter">
      <Filter.Bar>
        <Filter.Popover scope="adjust-closing-filter">
          <Filter.Trigger isFiltered={!!status} />
          <Combobox.Content>
            <Filter.View>
              <Command>
                <Filter.CommandInput
                  placeholder={t('filter')}
                  variant="secondary"
                  className="bg-background"
                />
                <Command.List className="p-1">
                  <Filter.Item value="status">
                    <IconFlag />
                    {t('status')}
                  </Filter.Item>
                </Command.List>
              </Command>
            </Filter.View>
            <Filter.View filterKey="status">
              <AdjustClosingStatusFilter />
            </Filter.View>
          </Combobox.Content>
        </Filter.Popover>
        <Filter.BarItem queryKey="status">
          <Filter.BarName>
            <IconFlag />
            {t('status')}
          </Filter.BarName>
          <Filter.BarButton filterKey="status">
            {status && t(status)}
          </Filter.BarButton>
        </Filter.BarItem>
      </Filter.Bar>
    </Filter>
  );
};
