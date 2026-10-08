import { Filter, DropdownMenu, Select, useQueryState } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

const options = [
  { labelKey: 'product', value: 'product' },
  { labelKey: 'type-service', value: 'service' },
  { labelKey: 'type-subscription', value: 'subscription' },
  { labelKey: 'type-unique', value: 'unique' },
];

export const ProductTypeFilterDropdown = ({ onOpenChange }: any) => {
  const { t } = useTranslation('product');
  const [filter, setFilter] = useQueryState<string>('type');

  return (
    <>
      <DropdownMenu.RadioGroup value={filter || ''} onValueChange={setFilter}>
        {options.map((option) => (
          <DropdownMenu.RadioItem
            value={option.value}
            key={option.value}
            onSelect={() => {
              setFilter(option.value);
              onOpenChange(false);
            }}
          >
            {t(option.labelKey)}
          </DropdownMenu.RadioItem>
        ))}
      </DropdownMenu.RadioGroup>
    </>
  );
};

export const ProductTypeFilterBar = () => {
  const { t } = useTranslation('product');
  const [filter, setFilter] = useQueryState<string>('type');

  return (
    <Select value={filter || ''} onValueChange={setFilter}>
      <Filter.BarButton>
        <Select.Value placeholder={t('select-type')} />
      </Filter.BarButton>
      <Select.Content>
        {options.map((option) => (
          <Select.Item value={option.value}>{t(option.labelKey)}</Select.Item>
        ))}
      </Select.Content>
    </Select>
  );
};
