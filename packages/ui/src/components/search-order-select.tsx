import { Select } from './select';

export type TSearchSortOrder = 'newest' | 'oldest';

export const SearchOrderSelect = ({
  value,
  newestLabel,
  oldestLabel,
  triggerClassName,
  onValueChange,
}: {
  value: TSearchSortOrder;
  newestLabel: string;
  oldestLabel: string;
  triggerClassName?: string;
  onValueChange: (value: TSearchSortOrder) => void;
}) => (
  <Select
    value={value}
    onValueChange={(nextValue) => onValueChange(nextValue as TSearchSortOrder)}
  >
    <Select.Trigger className={triggerClassName}>
      <Select.Value />
    </Select.Trigger>
    <Select.Content>
      <Select.Item value="newest">{newestLabel}</Select.Item>
      <Select.Item value="oldest">{oldestLabel}</Select.Item>
    </Select.Content>
  </Select>
);
