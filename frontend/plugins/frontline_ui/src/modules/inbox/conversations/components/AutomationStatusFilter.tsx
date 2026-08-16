import {
  Combobox,
  Command,
  Filter,
  Popover,
  Skeleton,
  useFilterContext,
  useQueryState,
} from 'erxes-ui';
import { IconRobot } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import {
  AUTOMATION_STATUS_FILTERS,
  TAutomationStatusFilter,
} from '@/inbox/constants/automationStatusFilters';

export type TAutomationStatusCounts = Partial<
  Record<TAutomationStatusFilter, number>
>;

const AutomationStatusList = ({
  counts,
  loading,
}: {
  counts?: TAutomationStatusCounts;
  loading?: boolean;
}) => {
  const { t } = useTranslation('frontline');
  const [value, setValue] = useQueryState<string>('automationStatus');
  const { resetFilterState } = useFilterContext();

  return (
    <Command>
      <Command.List>
        {AUTOMATION_STATUS_FILTERS.map(({ value: key, label, icon: Icon }) => (
          <Command.Item
            key={key}
            value={key}
            onSelect={() => {
              setValue(value === key ? null : key);
              resetFilterState();
            }}
          >
            <Icon />
            {t(label)}
            <span className="ml-auto flex items-center gap-2">
              {loading ? (
                <Skeleton className="size-4 rounded-full" />
              ) : (
                <span className="tabular-nums text-xs text-muted-foreground">
                  {counts?.[key] ?? 0}
                </span>
              )}
              <Combobox.Check checked={value === key} />
            </span>
          </Command.Item>
        ))}
      </Command.List>
    </Command>
  );
};

export const AutomationStatusFilterItem = () => {
  const { t } = useTranslation('frontline');

  return (
    <Filter.Item value="automationStatus">
      <IconRobot />
      {t('automation-status')}
    </Filter.Item>
  );
};

export const AutomationStatusFilterView = ({
  counts,
  loading,
}: {
  counts?: TAutomationStatusCounts;
  loading?: boolean;
}) => (
  <Filter.View filterKey="automationStatus">
    <AutomationStatusList counts={counts} loading={loading} />
  </Filter.View>
);

export const AutomationStatusFilterBar = ({
  iconOnly,
}: {
  iconOnly?: boolean;
}) => {
  const { t } = useTranslation('frontline');
  const [value] = useQueryState<string>('automationStatus');

  const selected = AUTOMATION_STATUS_FILTERS.find(
    (option) => option.value === value,
  );

  if (!selected) {
    return null;
  }

  return (
    <Filter.BarItem queryKey="automationStatus">
      <Filter.BarName>
        <IconRobot />
        {!iconOnly && t('automation-status')}
      </Filter.BarName>
      <Popover>
        <Popover.Trigger asChild>
          <Filter.BarButton filterKey="automationStatus">
            {t(selected.label)}
          </Filter.BarButton>
        </Popover.Trigger>
        <Combobox.Content>
          <AutomationStatusList />
        </Combobox.Content>
      </Popover>
    </Filter.BarItem>
  );
};
