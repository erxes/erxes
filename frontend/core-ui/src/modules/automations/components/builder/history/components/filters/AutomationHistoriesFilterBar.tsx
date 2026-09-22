import { STATUSES_BADGE_VARIABLES } from '@/automations/constants';
import { StatusBadgeValue } from '@/automations/types';
import { useAutomationHistoryFilterOptions } from '@/automations/components/builder/history/hooks/useAutomationHistoryFilterOptions';
import {
  IconAlertTriangle,
  IconCalendarPlus,
  IconCheck,
  IconClockPause,
  IconProgressCheck,
  IconTargetArrow,
} from '@tabler/icons-react';
import {
  Combobox,
  Command,
  Filter,
  Popover,
  useMultiQueryState,
} from 'erxes-ui';

const NodeFilterBarItem = ({
  filterKey,
  icon,
  label,
  value,
}: {
  filterKey: string;
  icon: React.ReactNode;
  label: string;
  value?: string | null;
}) => (
  <Filter.BarItem queryKey={filterKey}>
    <Filter.BarName>
      {icon}
      {label}
    </Filter.BarName>
    <Filter.BarButton filterKey={filterKey} inDialog>
      {value}
    </Filter.BarButton>
  </Filter.BarItem>
);

export const AutomationHistoriesFilterBar = () => {
  const { queries: nodeQueries, getActionLabel } =
    useAutomationHistoryFilterOptions();
  const [queries, setQueries] = useMultiQueryState<{
    status?: StatusBadgeValue;
    createdAt: string;
    createdAtTo: string;
  }>(['status', 'createdAt', 'createdAtTo']);
  return (
    <Filter.Bar>
      <Filter.BarItem queryKey="status">
        <Filter.BarName>
          <IconProgressCheck />
          Status
        </Filter.BarName>
        <Popover>
          <Popover.Trigger>
            <Filter.BarButton filterKey="status">
              {queries.status}
            </Filter.BarButton>
          </Popover.Trigger>
          <Popover.Content>
            <Command shouldFilter={false}>
              <Command.List className="p-1 ">
                <Combobox.Empty />
                {Object.entries(STATUSES_BADGE_VARIABLES).map(
                  ([value, className]) => (
                    <Command.Item
                      key={value}
                      value={value}
                      className={`cursor-pointer ${className}`}
                      // onSelect={() => setStatus(value === status ? '' : value)}
                      onSelect={() =>
                        setQueries({
                          status:
                            value === queries.status
                              ? undefined
                              : (value as StatusBadgeValue),
                        })
                      }
                    >
                      <span className="capitalize">{value}</span>
                      {queries.status === value && (
                        <IconCheck className="ml-auto" />
                      )}
                    </Command.Item>
                  ),
                )}
              </Command.List>
            </Command>
          </Popover.Content>
        </Popover>
      </Filter.BarItem>

      <Filter.BarItem queryKey="createdAt">
        <Filter.BarName>
          <IconCalendarPlus />
          Filter by created at
        </Filter.BarName>
        <Filter.Date filterKey="createdAt" />
      </Filter.BarItem>

      <NodeFilterBarItem
        filterKey="failedActionId"
        icon={<IconTargetArrow />}
        label="Failed at"
        value={getActionLabel(nodeQueries.failedActionId)}
      />
      <NodeFilterBarItem
        filterKey="errorCode"
        icon={<IconAlertTriangle />}
        label="Error"
        value={nodeQueries.errorCode}
      />
      <NodeFilterBarItem
        filterKey="waitingActionId"
        icon={<IconClockPause />}
        label="Waiting at"
        value={getActionLabel(nodeQueries.waitingActionId)}
      />
    </Filter.Bar>
  );
};
