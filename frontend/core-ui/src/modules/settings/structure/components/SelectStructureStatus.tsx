import { useState } from 'react';
import {
  Combobox,
  Command,
  Filter,
  Form,
  Popover,
  useFilterContext,
  useQueryState,
} from 'erxes-ui';
import { IconFlag } from '@tabler/icons-react';
import { STRUCTURE_STATUS_OPTIONS } from '../constants/structure-status';
import { useTranslation } from 'react-i18next';

const StructureStatusList = ({
  value,
  onSelect,
}: {
  value?: string;
  onSelect: (value: string) => void;
}) => {
  return (
    <Command>
      <Command.List>
        {STRUCTURE_STATUS_OPTIONS.map((status) => (
          <Command.Item
            key={status.value}
            value={status.value}
            onSelect={() => onSelect(status.value)}
          >
            <span className="font-medium">{status.label}</span>
            <Combobox.Check checked={value === status.value} />
          </Command.Item>
        ))}
      </Command.List>
    </Command>
  );
};

const SelectStructureStatusValue = ({ value }: { value?: string }) => {
  const { t } = useTranslation('settings');
  const selected = STRUCTURE_STATUS_OPTIONS.find(
    (status) => status.value === value,
  );

  if (!selected) {
    return (
      <span className="text-accent-foreground/80">{t('select-status', 'Select status')}</span>
    );
  }

  return <span className="font-medium text-sm">{selected.label}</span>;
};

export const SelectStructureStatusFilterItem = () => {
  const { t } = useTranslation('settings');
  return (
    <Filter.Item value="status">
      <IconFlag />
      {t('status', 'Status')}
    </Filter.Item>
  );
};

export const SelectStructureStatusFilterView = () => {
  const [status, setStatus] = useQueryState<string>('status');
  const { resetFilterState } = useFilterContext();

  return (
    <Filter.View filterKey="status">
      <StructureStatusList
        value={status || undefined}
        onSelect={(value) => {
          setStatus(value);
          resetFilterState();
        }}
      />
    </Filter.View>
  );
};

export const SelectStructureStatusFilterBar = () => {
  const { t } = useTranslation('settings');
  const [status, setStatus] = useQueryState<string>('status');
  const [open, setOpen] = useState(false);

  if (!status) {
    return null;
  }

  return (
    <Filter.BarItem queryKey="status">
      <Filter.BarName>
        <IconFlag />
        {t('status', 'Status')}
      </Filter.BarName>
      <Popover open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <Filter.BarButton filterKey="status">
            <SelectStructureStatusValue value={status} />
          </Filter.BarButton>
        </Popover.Trigger>
        <Combobox.Content>
          <StructureStatusList
            value={status}
            onSelect={(value) => {
              setStatus(value);
              setOpen(false);
            }}
          />
        </Combobox.Content>
      </Popover>
    </Filter.BarItem>
  );
};

export const SelectStructureStatusFormItem = ({
  value,
  onValueChange,
}: {
  value?: string | null;
  onValueChange: (value: string) => void;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Form.Control>
        <Combobox.Trigger className="w-full shadow-xs">
          <SelectStructureStatusValue value={value || undefined} />
        </Combobox.Trigger>
      </Form.Control>
      <Combobox.Content>
        <StructureStatusList
          value={value || undefined}
          onSelect={(newValue) => {
            onValueChange(newValue);
            setOpen(false);
          }}
        />
      </Combobox.Content>
    </Popover>
  );
};

export const SelectStructureStatus = {
  FilterItem: SelectStructureStatusFilterItem,
  FilterView: SelectStructureStatusFilterView,
  FilterBar: SelectStructureStatusFilterBar,
  FormItem: SelectStructureStatusFormItem,
};
