import { useEffect, useRef, useState } from 'react';
import {
  Combobox,
  Filter,
  Popover,
  useFilterContext,
  useQueryState,
} from 'erxes-ui';
import { IconUser } from '@tabler/icons-react';
import { SelectCompany, SelectCustomer, SelectMember } from 'ui-modules';

// The owner of a loyalty record can be a customer, a company or a team member.
// Instead of re-implementing the data fetching/selection for each, we delegate
// to the shared `ui-modules` selects and just pick the right one based on the
// currently selected owner type.
type OwnerParts = {
  Provider: React.ComponentType<any>;
  Content: React.ComponentType<any>;
  Value: React.ComponentType<any>;
  label: string;
  placeholder: string;
};

const getOwnerParts = (ownerType?: string | null): OwnerParts => {
  if (ownerType === 'company') {
    return {
      Provider: SelectCompany.Provider,
      Content: SelectCompany.Content,
      Value: SelectCompany.Value,
      label: 'Company',
      placeholder: 'Select company',
    };
  }
  if (ownerType === 'user') {
    return {
      Provider: SelectMember.Provider,
      Content: SelectMember.Content,
      Value: SelectMember.Value,
      label: 'Team Member',
      placeholder: 'Select team member',
    };
  }
  return {
    Provider: SelectCustomer.Provider,
    Content: SelectCustomer.Content,
    Value: SelectCustomer.Value,
    label: 'Customer',
    placeholder: 'Select customer',
  };
};

// Clears the selected owner whenever the owner type changes, so a stale id of
// the wrong type is never sent to the server.
const useResetOnOwnerTypeChange = (
  ownerType: string | null,
  value: string | null,
  setValue: (value: string | null) => void,
) => {
  const previousOwnerType = useRef(ownerType);

  useEffect(() => {
    if (previousOwnerType.current !== ownerType && value) {
      setValue(null);
    }
    previousOwnerType.current = ownerType;
  }, [ownerType, setValue, value]);
};

const SelectOwnerFilterItem = ({ queryKey }: { queryKey: string }) => (
  <Filter.Item value={queryKey}>
    <IconUser />
    Owner
  </Filter.Item>
);

const SelectOwnerFilterView = ({
  queryKey,
  ownerTypeKey,
}: {
  queryKey: string;
  ownerTypeKey: string;
}) => {
  const [value, setValue] = useQueryState<string>(queryKey);
  const [ownerType] = useQueryState<string>(ownerTypeKey);
  const { resetFilterState } = useFilterContext();

  useResetOnOwnerTypeChange(ownerType, value, setValue);

  const { Provider, Content } = getOwnerParts(ownerType);

  return (
    <Filter.View filterKey={queryKey}>
      <Provider
        mode="single"
        value={value || ''}
        onValueChange={(val: string | string[]) => {
          setValue((val as string) || null);
          resetFilterState();
        }}
      >
        <Content />
      </Provider>
    </Filter.View>
  );
};

const SelectOwnerFilterBar = ({
  queryKey,
  ownerTypeKey,
}: {
  queryKey: string;
  ownerTypeKey: string;
}) => {
  const [value, setValue] = useQueryState<string>(queryKey);
  const [ownerType] = useQueryState<string>(ownerTypeKey);
  const [open, setOpen] = useState(false);

  useResetOnOwnerTypeChange(ownerType, value, setValue);

  const { Provider, Content, Value, label, placeholder } =
    getOwnerParts(ownerType);

  if (!value) return null;

  return (
    <Filter.BarItem queryKey={queryKey}>
      <Filter.BarName>
        <IconUser />
        {label}
      </Filter.BarName>
      <Provider
        mode="single"
        value={value || ''}
        onValueChange={(val: string | string[]) => {
          setValue((val as string) || null);
          setOpen(false);
        }}
      >
        <Popover open={open} onOpenChange={setOpen}>
          <Popover.Trigger asChild>
            <Filter.BarButton filterKey={queryKey}>
              <Value placeholder={placeholder} />
            </Filter.BarButton>
          </Popover.Trigger>
          <Combobox.Content>
            <Content />
          </Combobox.Content>
        </Popover>
      </Provider>
    </Filter.BarItem>
  );
};

export const SelectOwner = {
  FilterItem: SelectOwnerFilterItem,
  FilterView: SelectOwnerFilterView,
  FilterBar: SelectOwnerFilterBar,
};
