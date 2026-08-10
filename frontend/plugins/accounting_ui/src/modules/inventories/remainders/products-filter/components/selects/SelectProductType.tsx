import { Combobox, Command, Filter, Popover, useFilterContext, useQueryState } from 'erxes-ui';
import { IconBox, IconCheck } from '@tabler/icons-react';
import { useState } from 'react';
import { PRODUCT_TYPES } from 'ui-modules/modules/products/constants/productTypes';
import { useTranslation } from 'react-i18next';

export function SelectProductTypeFilterItem() {
  const { t } = useTranslation('accounting');
  return (
    <Filter.Item value="type">
      <IconBox size={14} />
      {t('type')}
    </Filter.Item>
  );
}

export function SelectProductTypeFilterView() {
  const { t } = useTranslation('accounting');
  const [type, setType] = useQueryState<string>('type');
  const { resetFilterState } = useFilterContext();

  return (
    <Filter.View filterKey="type">
      <Command className="outline-hidden">
        <Command.Input placeholder={t('search-type')} />
        <Command.List>
          {PRODUCT_TYPES.map((pt) => (
            <Command.Item
              key={pt.value}
              value={pt.value}
              onSelect={() => {
                setType(pt.value);
                resetFilterState();
              }}
            >
              {pt.label}
              {type === pt.value && <IconCheck size={14} />}
            </Command.Item>
          ))}
        </Command.List>
      </Command>
    </Filter.View>
  );
}

export function SelectProductTypeFilterBar() {
  const { t } = useTranslation('accounting');
  const [type, setType] = useQueryState<string>('type');
  const [open, setOpen] = useState(false);

  if (!type) return null;

  const selected = PRODUCT_TYPES.find((pt) => pt.value === type);

  return (
    <Filter.BarItem queryKey="type">
      <Filter.BarName>
        <IconBox size={14} />
        {t('type')}
      </Filter.BarName>
      <Popover open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <Filter.BarButton filterKey="type">
            {selected?.label ?? <Combobox.Value placeholder={t('select-type')} />}
          </Filter.BarButton>
        </Popover.Trigger>
        <Combobox.Content>
          <Command className="outline-hidden">
            <Command.Input placeholder={t('search-type')} />
            <Command.List>
              {PRODUCT_TYPES.map((pt) => (
                <Command.Item
                  key={pt.value}
                  value={pt.value}
                  onSelect={() => {
                    setType(pt.value);
                    setOpen(false);
                  }}
                >
                  {pt.label}
                  {type === pt.value && <IconCheck size={14} />}
                </Command.Item>
              ))}
            </Command.List>
          </Command>
        </Combobox.Content>
      </Popover>
    </Filter.BarItem>
  );
}
