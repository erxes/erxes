import { SelectPriority } from '@/operation/components/SelectPriority';
import { SelectStatus } from '@/operation/components/SelectStatus';
import { TaskHotKeyScope } from '@/task/TaskHotkeyScope';
import { TasksTotalCount } from '@/task/components/TasksTotalCount';
import { SelectAssigneeTask } from '@/task/components/task-selects/SelectAssigneeTask';
import { SelectStatusTask } from '@/task/components/task-selects/SelectStatusTask';
import { TASKS_CURSOR_SESSION_KEY } from '@/task/constants';
import { SelectTeam } from '@/team/components/SelectTeam';
import {
  IconAlertSquareRounded,
  IconProgressCheck,
  IconSearch,
  IconSquareRotated,
  IconUser,
  IconUsers,
} from '@tabler/icons-react';
import clsx from 'clsx';
import { Combobox, Command, Filter, useMultiQueryState } from 'erxes-ui';
import { useParams } from 'react-router-dom';
import { SelectMilestone } from './task-selects/SelectMilestone';
import { TagsFilter } from 'ui-modules';

const TasksFilterPopover = () => {
  const { teamId, projectId } = useParams();
  const [queries] = useMultiQueryState<{
    searchValue: string;
    assignee: string;
    team: string;
    priority: string;
    status: string;
    milestone: string;
  }>(['searchValue', 'assignee', 'team', 'priority', 'status', 'milestone']);

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
                <TagsFilter />
                {(projectId && !queries?.milestone) && (
                  <Filter.Item value="milestone">
                    <IconSquareRotated />
                    Milestone
                  </Filter.Item>
                )}
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
          <TagsFilter.View/>
          {(projectId && !queries?.milestone) && (
            <SelectMilestone.FilterView projectId={projectId || ''} />
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
  const { teamId, projectId } = useParams();
  const [queries] = useMultiQueryState<{
    searchValue: string;
    assignee: string;
    team: string;
    priority: string;
    status: string;
    milestone: string;
    tags: string[];
  }>(['searchValue', 'assignee', 'team', 'priority', 'status', 'milestone', 'tags']);
  const { searchValue, milestone } = queries || {};

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
        <TagsFilter.Bar/>
        {(projectId && milestone) && (
          <Filter.BarItem queryKey="milestone">
            <Filter.BarName>
              <IconSquareRotated />
              Milestone
            </Filter.BarName>
            <SelectMilestone.FilterBar projectId={projectId} />
          </Filter.BarItem>
        )}
        <TasksFilterPopover />
        <TasksTotalCount />
      </Filter.Bar>
    </Filter>
  );
};
