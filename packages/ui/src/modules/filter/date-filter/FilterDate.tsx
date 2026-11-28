import { useQueryState } from 'nuqs';
import { type ComponentProps, useState } from 'react';
import { Button } from 'erxes-ui/components/button';
import { Combobox } from 'erxes-ui/components/combobox';
import { Popover } from 'erxes-ui/components/popover';
import { useFilterContext } from '../hooks/useFilterContext';
import { DateFilterCommand, useDateFilterLabel } from './DateFilterCommand';

/** A date filter's presets in the filter popover, in `Filter.View`: a pick closes it. */
export const FilterPopoverDateView = ({
  filterKey,
  label,
}: {
  filterKey: string;
  label?: string;
}) => {
  const { resetFilterState } = useFilterContext();
  const [query, setQuery] = useQueryState(filterKey);

  return (
    <DateFilterCommand
      focusOnMount
      value={filterKey}
      label={label}
      selected={query ?? ''}
      onSelect={(value) => {
        void setQuery(value);
        resetFilterState();
      }}
    />
  );
};

/** A date filter's value on its bar chip, which picks another preset. */
export const FilterBarDate = ({
  filterKey,
  label,
  ...props
}: Omit<ComponentProps<typeof Button>, 'children'> & {
  filterKey: string;
  label?: string;
}) => {
  const [query, setQuery] = useQueryState(filterKey);
  const [open, setOpen] = useState(false);
  const labelOf = useDateFilterLabel();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Popover.Trigger render={<Button variant="segment" {...props} />}>
        {labelOf(query ?? '')}
      </Popover.Trigger>
      <Combobox.Content>
        <DateFilterCommand
          value={filterKey}
          label={label}
          selected={query ?? ''}
          onSelect={(value) => {
            void setQuery(value);
            setOpen(false);
          }}
        />
      </Combobox.Content>
    </Popover>
  );
};
