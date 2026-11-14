import { useAutomationDashboardPicker } from '@/automations/dashboard/hooks/useAutomationDashboardPicker';
import { IconX } from '@tabler/icons-react';
import { Badge, Combobox, Command, Popover, cn } from 'erxes-ui';
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
  const {
    open,
    setOpen,
    search,
    setSearch,
    options,
    loading,
    error,
    totalCount,
    handleFetchMore,
    selected,
    showSelected,
    triggerLabel,
    toggle,
  } = useAutomationDashboardPicker({ value, onChange, max });

  return (
    <div className="flex flex-col gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <Combobox.Trigger className="w-full justify-between">
          <span className="truncate">{triggerLabel}</span>
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
              {options.map(({ automation, checked, disabled }) => (
                <Command.Item
                  key={automation._id}
                  value={automation._id}
                  disabled={disabled}
                  onSelect={() => toggle(automation._id)}
                >
                  <StatusDot status={automation.status} />
                  <span className="truncate">{automation.name}</span>
                  <Combobox.Check checked={checked} />
                </Command.Item>
              ))}
              {!loading && (
                <Combobox.FetchMore
                  fetchMore={handleFetchMore}
                  currentLength={options.length}
                  totalCount={totalCount}
                />
              )}
            </Command.List>
          </Command>
        </Combobox.Content>
      </Popover>
      {showSelected && (
        <div className="flex flex-wrap gap-1">
          {selected.map((automation) => (
            <Badge key={automation._id} variant="secondary" className="gap-1">
              {automation.name}
              <button
                type="button"
                aria-label={t('dashboard-remove-automation')}
                onClick={() => toggle(automation._id)}
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
