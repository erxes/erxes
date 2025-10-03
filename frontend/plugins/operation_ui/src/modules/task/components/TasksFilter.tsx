import {
  IconAlertSquareRounded,
  IconProgressCheck,
  IconSearch,
  IconUser,
  IconUsers,
} from '@tabler/icons-react';
import { Combobox, Command, Filter, useMultiQueryState } from 'erxes-ui';
import { TaskHotKeyScope } from '@/task/TaskHotkeyScope';
import { TasksTotalCount } from '@/task/components/TasksTotalCount';
import { TASKS_CURSOR_SESSION_KEY } from '@/task/constants';
import { SelectPriority } from '@/operation/components/SelectPriority';
import { SelectStatusTask } from '@/task/components/task-selects/SelectStatusTask';
import { useParams } from 'react-router-dom';
import { SelectAssigneeTask } from '@/task/components/task-selects/SelectAssigneeTask';
import clsx from 'clsx';
import { SelectTeam } from '@/team/components/SelectTeam';
import { SelectStatus } from '@/operation/components/SelectStatus';

const TasksFilterPopover = () => {
  const { teamId } = useParams();
  const [queries] = useMultiQueryState<{
    searchValue: string;
    assignee: string;
    team: string;
    priority: string;
    status: string;
  }>(['searchValue', 'assignee', 'team', 'priority', 'status']);

  const hasFilters = Object.values(queries || {}).some(
    (value) => value !== null,
  );

  return (
    <>
      <Filter.Popover scope={TaskHotKeyScope.TasksPage}>
        <Filter.Trigger isFiltered={hasFilters} />
        <Combobox.Content>
          <Filter.View>
            <Command>
              <Filter.CommandInput
                placeholder="Filter"
                variant="secondary"
                className="bg-background"
              />
              <Command.List className="p-1">
                <Filter.Item value="searchValue" inDialog>
                  <IconSearch />
                  Search
                </Filter.Item>
                <Command.Separator className="my-1" />
                <Filter.Item value="assignee">
                  <IconUser />
                  Assignee
                </Filter.Item>
                {!teamId && (
                  <Filter.Item value="team">
                    <IconUsers />
                    Team
                  </Filter.Item>
                )}
                <Filter.Item value="priority">
                  <IconAlertSquareRounded />
                  Priority
                </Filter.Item>
                <Filter.Item value="status">
                  <IconProgressCheck />
                  Status
                </Filter.Item>
              </Command.List>
            </Command>
          </Filter.View>
          <SelectAssigneeTask.FilterView teamIds={[teamId || '']} />
          {!teamId && <SelectTeam.FilterView />}
          <SelectPriority.FilterView />
          {teamId ? (
            <SelectStatusTask.FilterView teamId={teamId} />
          ) : (
            <SelectStatus.FilterView />
          )}
        </Combobox.Content>
      </Filter.Popover>
      <Filter.Dialog>
        <Filter.View filterKey="searchValue" inDialog>
          <Filter.DialogStringView filterKey="searchValue" />
        </Filter.View>
      </Filter.Dialog>
    </>
  );
};

export const TasksFilter = () => {
  const { teamId } = useParams();
  const [queries] = useMultiQueryState<{
    searchValue: string;
    assignee: string;
    team: string;
    priority: string;
    status: string;
  }>(['searchValue', 'assignee', 'team', 'priority', 'status']);
  const { searchValue } = queries || {};

  return (
    <Filter id="Tasks-filter" sessionKey={TASKS_CURSOR_SESSION_KEY}>
      <Filter.Bar>
        {searchValue && (
          <Filter.BarItem queryKey="searchValue">
            <Filter.BarName>
              <IconSearch />
              Search
            </Filter.BarName>
            <Filter.BarButton filterKey="searchValue" inDialog>
              {searchValue}
            </Filter.BarButton>
          </Filter.BarItem>
        )}
        {!teamId && (
          <Filter.BarItem queryKey="team">
            <Filter.BarName>
              <IconUsers />
              Team
            </Filter.BarName>
            <SelectTeam.FilterBar />
          </Filter.BarItem>
        )}
        <Filter.BarItem queryKey="priority">
          <Filter.BarName>
            <IconAlertSquareRounded />
            Priority
          </Filter.BarName>
          <SelectPriority.FilterBar />
        </Filter.BarItem>
        <Filter.BarItem queryKey="status">
          <Filter.BarName>
            <IconProgressCheck />
            Status
          </Filter.BarName>
          {teamId ? (
            <SelectStatusTask.FilterBar
              teamId={teamId}
              scope={clsx(TaskHotKeyScope.TasksPage, 'filter', 'Status')}
            />
          ) : (
            <SelectStatus.FilterBar />
          )}
        </Filter.BarItem>
        <Filter.BarItem queryKey="assignee">
          <Filter.BarName>
            <IconUser />
            Assignee
          </Filter.BarName>
          <SelectAssigneeTask.FilterBar />
        </Filter.BarItem>
        <TasksFilterPopover />
        <TasksTotalCount />
      </Filter.Bar>
    </Filter>
  );
};
