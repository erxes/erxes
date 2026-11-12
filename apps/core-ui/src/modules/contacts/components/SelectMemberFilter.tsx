import { IconUser } from '@tabler/icons-react';
import { Combobox, Filter, Popover, useFilterContext, useQueryState } from 'erxes-ui';
import { useState } from 'react';
import {
  SelectMemberContent,
  SelectMemberProvider,
  SelectMemberValue,
} from './SelectMemberProvider';

/** Adds the member option to a filter menu. */
export const SelectMemberFilterItem = ({
  value = 'ownerId',
  label = 'Owner',
}: {
  value?: string;
  label?: string;
}) => (
  <Filter.Item value={value}>
    <IconUser />
    {label}
  </Filter.Item>
);

/** The member list inside the filter popover. */
export const SelectMemberFilterView = ({ queryKey = 'ownerId' }: { queryKey?: string }) => {
  const [ownerId, setOwnerId] = useQueryState<string>(queryKey);
  const { resetFilterState } = useFilterContext();

  return (
    <Filter.View filterKey={queryKey}>
      <SelectMemberProvider
        value={ownerId}
        onValueChange={(next) => {
          setOwnerId(typeof next === 'string' ? next : null);
          resetFilterState();
        }}
      >
        <SelectMemberContent />
      </SelectMemberProvider>
    </Filter.View>
  );
};

/** The chosen member as a filter bar chip. */
export const SelectMemberFilterBar = ({
  queryKey = 'ownerId',
  label = 'Owner',
}: {
  queryKey?: string;
  label?: string;
}) => {
  const [ownerId, setOwnerId] = useQueryState<string>(queryKey);
  const [open, setOpen] = useState(false);

  if (!ownerId) return null;

  return (
    <Filter.BarItem queryKey={queryKey}>
      <Filter.BarName>
        <IconUser />
        {label}
      </Filter.BarName>
      <SelectMemberProvider
        value={ownerId}
        onValueChange={(next) => {
          setOwnerId(typeof next === 'string' && next ? next : null);
          setOpen(false);
        }}
      >
        <Popover open={open} onOpenChange={setOpen}>
          <Popover.Trigger asChild>
            <Filter.BarButton filterKey={queryKey}>
              <SelectMemberValue />
            </Filter.BarButton>
          </Popover.Trigger>
          <Combobox.Content>
            <SelectMemberContent />
          </Combobox.Content>
        </Popover>
      </SelectMemberProvider>
    </Filter.BarItem>
  );
};
