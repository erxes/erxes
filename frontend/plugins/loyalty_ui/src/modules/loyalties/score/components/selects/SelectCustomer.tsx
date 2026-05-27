import { SelectOwner } from '~/modules/loyalties/components/SelectOwner';

export const SelectScoreCustomerFilterItem = () => (
  <SelectOwner.FilterItem queryKey="scoreOwnerId" />
);

export const SelectScoreCustomerFilterView = ({
  queryKey = 'scoreOwnerId',
}: {
  queryKey?: string;
}) => (
  <SelectOwner.FilterView
    queryKey={queryKey}
    ownerTypeKey="scoreOwnerType"
  />
);

export const SelectScoreCustomerFilterBar = () => (
  <SelectOwner.FilterBar
    queryKey="scoreOwnerId"
    ownerTypeKey="scoreOwnerType"
  />
);

export const SelectScoreCustomerFormItem = ({
  value,
  onValueChange,
  placeholder,
  className,
}: {
  value: string;
  onValueChange: (val: string, label?: string) => void;
  placeholder?: string;
  className?: string;
}) => (
  <SelectOwner.FormItem
    value={value}
    ownerType="customer"
    onValueChange={onValueChange}
    placeholder={placeholder}
    className={className}
  />
);

export const SelectScoreCustomer = Object.assign(SelectOwner, {
  FilterItem: SelectScoreCustomerFilterItem,
  FilterView: SelectScoreCustomerFilterView,
  FilterBar: SelectScoreCustomerFilterBar,
  FormItem: SelectScoreCustomerFormItem,
});
