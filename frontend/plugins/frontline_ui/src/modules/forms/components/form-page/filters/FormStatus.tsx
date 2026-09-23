import {
  IconCircleCheck,
  IconCircleDashed,
  IconCircleX,
  IconClock,
  IconSquareToggle,
} from '@tabler/icons-react';
import {
  Badge,
  Combobox,
  Command,
  Filter,
  Popover,
  useFilterContext,
  useQueryState,
} from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  active: 'Active',
  rejected: 'Rejected',
  archived: 'Archived',
};

const DEFAULT_STATUSES = ['active', 'archived'];

const StatusOptions = ({
  statuses,
  onSelect,
}: {
  statuses: string[];
  onSelect: (value: string) => void;
}) => {
  const { t } = useTranslation('frontline');

  return (
    <Command.Group>
      {statuses.map((status) => (
        <Command.Item key={status} onSelect={onSelect} value={status}>
          {t(status, STATUS_LABELS[status] || status)}
        </Command.Item>
      ))}
    </Command.Group>
  );
};

const BarItem = ({ statuses = DEFAULT_STATUSES }: { statuses?: string[] }) => {
  const [query, setQuery] = useQueryState<string | null>('status');
  const [open, setOpen] = useState(false);
  const handleSelect = (value: string) => {
    setQuery(value);
    setOpen(false);
  };
  return (
    <Filter.BarItem queryKey="status">
      <Filter.BarName>
        <IconSquareToggle />
      </Filter.BarName>
      <Popover open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <Filter.BarButton filterKey={'status'} className="capitalize">
            {query || ''}
          </Filter.BarButton>
        </Popover.Trigger>
        <Combobox.Content>
          <Command>
            <Command.List>
              <StatusOptions statuses={statuses} onSelect={handleSelect} />
            </Command.List>
          </Command>
        </Combobox.Content>
      </Popover>
    </Filter.BarItem>
  );
};

const View = ({ statuses = DEFAULT_STATUSES }: { statuses?: string[] }) => {
  const [_, setQuery] = useQueryState<string | null>('status');
  const { resetFilterState } = useFilterContext();
  const handleSelect = (value: string) => {
    setQuery(value);
    resetFilterState();
  };
  return (
    <Filter.View filterKey={'status'}>
      <Combobox.Content>
        <Command>
          <Command.List>
            <StatusOptions statuses={statuses} onSelect={handleSelect} />
          </Command.List>
        </Command>
      </Combobox.Content>
    </Filter.View>
  );
};

const Item = () => {
  const { t } = useTranslation('frontline');
  return (
    <Filter.Item value="status">
      <IconSquareToggle />
      {t('status', 'Status')}
    </Filter.Item>
  );
};

const STATUS_BADGES: Record<
  string,
  {
    variant: 'success' | 'warning' | 'destructive' | 'secondary';
    icon: typeof IconCircleCheck;
  }
> = {
  active: { variant: 'success', icon: IconCircleCheck },
  pending: { variant: 'warning', icon: IconClock },
  rejected: { variant: 'destructive', icon: IconCircleX },
};

const StatusBadge = ({ status }: { status: string }) => {
  const { variant, icon: Icon } = STATUS_BADGES[status] || {
    variant: 'secondary' as const,
    icon: IconCircleDashed,
  };

  return (
    <Badge variant={variant}>
      <Icon size={16} />
      {status}
    </Badge>
  );
};

export const FormStatus = Object.assign({
  BarItem,
  View,
  Item,
  Badge: StatusBadge,
});
