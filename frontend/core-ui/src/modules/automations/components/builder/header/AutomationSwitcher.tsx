import { useAutomation } from '@/automations/context/AutomationProvider';
import { useAutomationSwitcher } from '@/automations/hooks/useAutomationSwitcher';
import { Combobox, Command, Popover, Separator, cn } from 'erxes-ui';
import { IconArrowsExchange } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

const AutomationSwitcherStatusDot = ({ status }: { status: string }) => (
  <span
    className={cn(
      'size-2 shrink-0 rounded-full',
      status === 'active' ? 'bg-success' : 'bg-muted-foreground/40',
    )}
  />
);

export const AutomationSwitcher = () => {
  const { t } = useTranslation('automations');
  const { detail } = useAutomation();
  const {
    open,
    setOpen,
    search,
    setSearch,
    automations,
    loading,
    error,
    totalCount,
    handleFetchMore,
    handleSelect,
  } = useAutomationSwitcher(detail?._id);

  if (!detail) {
    return null;
  }

  return (
    <>
      <Separator.Inline />
      <Popover open={open} onOpenChange={setOpen}>
        <Combobox.Trigger
          variant="ghost"
          className="w-auto text-muted-foreground"
          aria-label={t('switch-automation')}
        >
          <IconArrowsExchange className="size-4" />
          {t('switch')}
        </Combobox.Trigger>
        <Combobox.Content className="w-80">
          <Command shouldFilter={false}>
            <Command.Input
              value={search}
              onValueChange={setSearch}
              placeholder={t('search-automations')}
            />
            <Command.List>
              <Combobox.Empty loading={loading} error={error} />
              {automations.map((automation) => (
                <Command.Item
                  key={automation._id}
                  value={automation._id}
                  onSelect={handleSelect}
                >
                  <AutomationSwitcherStatusDot status={automation.status} />
                  <span className="truncate">{automation.name}</span>
                  <Combobox.Check checked={automation._id === detail._id} />
                </Command.Item>
              ))}
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
    </>
  );
};
