import { Filter, DropdownMenu, Select, useQueryState } from 'erxes-ui';

const options = [
  { label: 'Product', value: 'product' },
  { label: 'Service', value: 'service' },
  { label: 'Subscription', value: 'subscription' },
  { label: 'Unique', value: 'unique' },
];

export const ProductTypeFilterDropdown = ({ onOpenChange }: any) => {
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
            {option.label}
          </DropdownMenu.RadioItem>
        ))}
      </DropdownMenu.RadioGroup>
    </>
  );
};

export const ProductTypeFilterBar = () => {
  const [filter, setFilter] = useQueryState<string>('type');

  return (
    <Select value={filter || ''} onValueChange={setFilter}>
      <Filter.BarButton>
        <Select.Value placeholder="Select type" />
      </Filter.BarButton>
      <Select.Content>
        {options.map((option) => (
          <Select.Item value={option.value}>{option.label}</Select.Item>
        ))}
      </Select.Content>
    </Select>
  );
};
