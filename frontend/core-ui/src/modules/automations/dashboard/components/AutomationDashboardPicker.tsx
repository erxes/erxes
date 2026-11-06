import { useAutomationDashboardList } from '@/automations/dashboard/hooks/useAutomationDashboardList';
import { useAutomationSearchList } from '@/automations/hooks/useAutomationSearchList';
import { IconX } from '@tabler/icons-react';
import { Badge, Combobox, Command, Popover, cn } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const StatusDot = ({ status }: { status?: string }) => (
  <span
    className={cn(
      'size-2 shrink-0 rounded-full',
      status === 'active' ? 'bg-success' : 'bg-muted-foreground/40',
    )}
  />
);

/** Picks automations by name; with `max` 1 a pick replaces the current one. */
export const AutomationDashboardPicker = ({
  value,
  onChange,
  max,
}: {
  value: string[];
  onChange: (ids: string[]) => void;
  max: number;
}) => {
  const { t } = useTranslation('automations');
  const [open, setOpen] = useState(false);
  const {
    search,
    setSearch,
    automations,
    loading,
    error,
    totalCount,
    handleFetchMore,
  } = useAutomationSearchList(open);
  const { automations: selected } = useAutomationDashboardList(value);

  const isFull = max > 1 && value.length >= max;

  const handleSelect = (id: string) => {
    if (value.includes(id)) {
      onChange(value.filter((current) => current !== id));
      return;
    }

    if (max === 1) {
      onChange([id]);
      setOpen(false);
      return;
    }

    if (!isFull) {
      onChange([...value, id]);
    }
  };

  const triggerLabel = () => {
    if (!value.length) {
      return t('dashboard-pick-automation');
    }

    if (max === 1) {
      return selected[0]?.name || t('dashboard-automation-unavailable');
    }

    return t('dashboard-selected-count', { count: value.length, max });
  };

  return (
    <div className="flex flex-col gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <Combobox.Trigger className="w-full justify-between">
          <span className="truncate">{triggerLabel()}</span>
        </Combobox.Trigger>
        <Combobox.Content className="w-(--radix-popover-trigger-width)">
          <Command shouldFilter={false}>
            <Command.Input
              value={search}
              onValueChange={setSearch}
              placeholder={t('search-automations')}
            />
            <Command.List>
              <Combobox.Empty loading={loading} error={error} />
              {automations.map((automation) => {
                const checked = value.includes(automation._id);

                return (
                  <Command.Item
                    key={automation._id}
                    value={automation._id}
                    disabled={!checked && isFull}
                    onSelect={handleSelect}
                  >
                    <StatusDot status={automation.status} />
                    <span className="truncate">{automation.name}</span>
                    <Combobox.Check checked={checked} />
                  </Command.Item>
                );
              })}
              {!loading && (
                <Combobox.FetchMore
                  fetchMore={handleFetchMore}
                  currentLength={automations.length}
                  totalCount={totalCount}
                />
              )}
            </Command.List>
          </Command>
        </Combobox.Content>
      </Popover>
      {max > 1 && !!selected.length && (
        <div className="flex flex-wrap gap-1">
          {selected.map((automation) => (
            <Badge key={automation._id} variant="secondary" className="gap-1">
              {automation.name}
              <button
                type="button"
                aria-label={t('dashboard-remove-automation')}
                onClick={() => handleSelect(automation._id)}
              >
                <IconX className="size-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};
