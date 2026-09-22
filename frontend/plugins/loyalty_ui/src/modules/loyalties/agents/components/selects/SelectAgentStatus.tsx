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
import { useTranslation } from 'react-i18next';
import { IconCheck } from '@tabler/icons-react';

const OPTIONS = [
  { value: 'active', label: 'active' },
  { value: 'draft', label: 'draft' },
];

const StatusContent = ({
  value,
  onSelect,
}: {
  value: string;
  onSelect: (v: string) => void;
}) => {
  const { t } = useTranslation('loyalty');
  return (
  <Command>
    <Command.Input placeholder={t('search')} />
    <Command.Empty>{t('no-statuses-found')}</Command.Empty>
    <Command.List>
      {OPTIONS.map((o) => (
        <Command.Item
          key={o.value}
          value={o.value}
          onSelect={() => onSelect(o.value)}
        >
          {t(o.label)}
          <Combobox.Check checked={value === o.value} />
        </Command.Item>
      ))}
    </Command.List>
  </Command>
  );
};

const FilterItem = () => {
  const { t } = useTranslation('loyalty');
  return (
    <Filter.Item value="agentStatus">
      <IconCheck />
      {t('status')}
    </Filter.Item>
  );
};

const FilterView = ({ queryKey = 'agentStatus' }: { queryKey?: string }) => {
  const [status, setStatus] = useQueryState<string>(queryKey);
  const { resetFilterState } = useFilterContext();
  return (
    <Filter.View filterKey={queryKey}>
      <StatusContent
        value={status || ''}
        onSelect={(v) => {
          setStatus(v);
          resetFilterState();
        }}
      />
    </Filter.View>
  );
};

const FilterBar = () => {
  const [status, setStatus] = useQueryState<string>('agentStatus');
  const [open, setOpen] = useState(false);
  const { t } = useTranslation('loyalty');
  const label = OPTIONS.find((o) => o.value === status)?.label;

  return (
    <Filter.BarItem queryKey="agentStatus">
      <Filter.BarName>
        <IconCheck />
        {t('status')}
      </Filter.BarName>
      <Popover open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <Filter.BarButton filterKey="agentStatus">
            <span>{label ? t(label) : t('select-status')}</span>
          </Filter.BarButton>
        </Popover.Trigger>
        <Combobox.Content>
          <StatusContent
            value={status || ''}
            onSelect={(v) => {
              setStatus(v || null);
              setOpen(false);
            }}
          />
        </Combobox.Content>
      </Popover>
    </Filter.BarItem>
  );
};

const FormItem = ({
  value,
  onValueChange,
  placeholder,
}: {
  value: string;
  onValueChange: (v: string) => void;
  placeholder?: string;
}) => {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation('loyalty');
  const label = OPTIONS.find((o) => o.value === value)?.label;
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Form.Control>
        <Combobox.Trigger className="w-full shadow-xs">
          <span className={label ? '' : 'text-accent-foreground/80'}>
            {label ? t(label) : placeholder || t('select-status')}
          </span>
        </Combobox.Trigger>
      </Form.Control>
      <Combobox.Content>
        <StatusContent
          value={value}
          onSelect={(v) => {
            onValueChange(v);
            setOpen(false);
          }}
        />
      </Combobox.Content>
    </Popover>
  );
};

export const SelectAgentStatus = {
  FilterItem,
  FilterView,
  FilterBar,
  FormItem,
};
