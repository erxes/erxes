import {
  Combobox,
  Command,
  Filter,
  Popover,
  useFilterContext,
  useQueryState,
} from 'erxes-ui';
import { IconToggleLeft } from '@tabler/icons-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const STATUS_OPTIONS = [
  { value: 'new', label: 'new' },
  { value: 'won', label: 'won' },
  { value: 'loss', label: 'loss' },
];

export const SelectAssignmentStatusFilterItem = () => {
  const { t } = useTranslation('loyalty');
  return (
    <Filter.Item value="assignmentStatus">
      <IconToggleLeft />
      {t('status')}
    </Filter.Item>
  );
};

export const SelectAssignmentStatusFilterView = () => {
  const [value, setValue] = useQueryState<string>('assignmentStatus');
  const { resetFilterState } = useFilterContext();
  const { t } = useTranslation('loyalty');

  return (
    <Filter.View filterKey="assignmentStatus">
      <Command>
        <Command.List>
          {STATUS_OPTIONS.map((opt) => (
            <Command.Item
              key={opt.value}
              value={opt.value}
              onSelect={() => {
                setValue(opt.value);
                resetFilterState();
              }}
            >
              {t(opt.label)}
              <Combobox.Check checked={value === opt.value} />
            </Command.Item>
          ))}
        </Command.List>
      </Command>
    </Filter.View>
  );
};

export const SelectAssignmentStatusFilterBar = () => {
  const [value, setValue] = useQueryState<string>('assignmentStatus');
  const [open, setOpen] = useState(false);
  const { t } = useTranslation('loyalty');
  const selected = STATUS_OPTIONS.find((o) => o.value === value);

  return (
    <Filter.BarItem queryKey="assignmentStatus">
      <Filter.BarName>
        <IconToggleLeft />
        {t('status')}
      </Filter.BarName>
      <Popover open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <Filter.BarButton filterKey="assignmentStatus">
            <span>{selected ? t(selected.label) : t('status')}</span>
          </Filter.BarButton>
        </Popover.Trigger>
        <Combobox.Content>
          <Command>
            <Command.List>
              {STATUS_OPTIONS.map((opt) => (
                <Command.Item
                  key={opt.value}
                  value={opt.value}
                  onSelect={() => {
                    setValue(opt.value);
                    setOpen(false);
                  }}
                >
                  {t(opt.label)}
                  <Combobox.Check checked={value === opt.value} />
                </Command.Item>
              ))}
            </Command.List>
          </Command>
        </Combobox.Content>
      </Popover>
    </Filter.BarItem>
  );
};
