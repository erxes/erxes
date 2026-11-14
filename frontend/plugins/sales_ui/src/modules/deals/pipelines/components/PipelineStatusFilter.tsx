import { useState } from 'react';
import { IconProgressCheck } from '@tabler/icons-react';
import {
  Combobox,
  Command,
  Filter,
  Popover,
  useFilterContext,
  useFilterQueryState,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const PIPELINE_STATUS_QUERY_KEY = 'pipelineStatus';

const usePipelineStatusOptions = () => {
  const { t } = useTranslation('sales');

  return [
    { value: 'active', label: t('active', 'Active') },
    { value: 'archived', label: t('archived', 'Archived') },
  ];
};

const PipelineStatusContent = ({
  value,
  onValueChange,
}: Readonly<{
  value: string;
  onValueChange: (status: string) => void;
}>) => {
  const { t } = useTranslation('sales');
  const options = usePipelineStatusOptions();

  return (
    <Command>
      <Command.Input placeholder={t('search', 'Search')} />
      <Command.List>
        {options.map((status) => (
          <Command.Item
            key={status.value}
            value={status.value}
            onSelect={() => onValueChange(status.value)}
          >
            <span className="font-medium">{status.label}</span>
            <Combobox.Check checked={value === status.value} />
          </Command.Item>
        ))}
      </Command.List>
    </Command>
  );
};

const PipelineStatusFilterItem = () => {
  const { t } = useTranslation('sales');

  return (
    <Filter.Item value={PIPELINE_STATUS_QUERY_KEY}>
      <IconProgressCheck />
      {t('status', 'Status')}
    </Filter.Item>
  );
};

const PipelineStatusFilterView = () => {
  const [status, setStatus] = useFilterQueryState<string>(
    PIPELINE_STATUS_QUERY_KEY,
  );
  const { resetFilterState } = useFilterContext();

  return (
    <Filter.View filterKey={PIPELINE_STATUS_QUERY_KEY}>
      <PipelineStatusContent
        value={status || ''}
        onValueChange={(value) => {
          setStatus(value);
          resetFilterState();
        }}
      />
    </Filter.View>
  );
};

const PipelineStatusFilterBar = () => {
  const [status, setStatus] = useFilterQueryState<string>(
    PIPELINE_STATUS_QUERY_KEY,
  );
  const [open, setOpen] = useState(false);
  const { t } = useTranslation('sales');
  const options = usePipelineStatusOptions();

  const selectedStatus = options.find((option) => option.value === status);

  return (
    <Filter.BarItem queryKey={PIPELINE_STATUS_QUERY_KEY}>
      <Filter.BarName>
        <IconProgressCheck />
        {t('status', 'Status')}
      </Filter.BarName>
      <Popover open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <Filter.BarButton filterKey={PIPELINE_STATUS_QUERY_KEY}>
            {selectedStatus?.label ?? status}
          </Filter.BarButton>
        </Popover.Trigger>
        <Combobox.Content>
          <PipelineStatusContent
            value={status || ''}
            onValueChange={(value) => {
              setStatus(value || null);
              setOpen(false);
            }}
          />
        </Combobox.Content>
      </Popover>
    </Filter.BarItem>
  );
};

export const PipelineStatusFilter = {
  Item: PipelineStatusFilterItem,
  View: PipelineStatusFilterView,
  Bar: PipelineStatusFilterBar,
};
