import { Filter, DropdownMenu, Select, useQueryState } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

const options = [
  { label: 'product', value: 'product' },
  { label: 'service', value: 'service' },
  { label: 'subscription', value: 'subscription' },
  { label: 'unique', value: 'unique' },
];

export const ProductTypeFilterDropdown = ({ onOpenChange }: any) => {
  const { t } = useTranslation('accounting');
  const [filter, setFilter] = useQueryState<string>('type');

  return (
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
          {t(option.label)}
        </DropdownMenu.RadioItem>
      ))}
    </DropdownMenu.RadioGroup>
  );
};

export const ProductTypeFilterBar = () => {
  const { t } = useTranslation('accounting');
  const [filter, setFilter] = useQueryState<string>('type');

  return (
    <Select value={filter || ''} onValueChange={setFilter}>
      <Filter.BarButton>
        <Select.Value placeholder={t('select-type')} />
      </Filter.BarButton>
      <Select.Content>
        {options.map((option) => (
          <Select.Item key={option.value} value={option.value}>
            {t(option.label)}
          </Select.Item>
        ))}
      </Select.Content>
    </Select>
  );
};
