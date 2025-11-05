import { SelectPriority } from '@/operation/components/SelectPriority';
import { SelectStatus } from '@/operation/components/SelectStatus';
import { TaskHotKeyScope } from '@/task/TaskHotkeyScope';
import { TasksTotalCount } from '@/task/components/TasksTotalCount';
import { SelectAssigneeTask } from '@/task/components/task-selects/SelectAssigneeTask';
import { SelectStatusTask } from '@/task/components/task-selects/SelectStatusTask';
import { SelectCycle } from '@/task/components/task-selects/SelectCycle';
import { TASKS_CURSOR_SESSION_KEY } from '@/task/constants';
import { SelectTeam } from '@/team/components/SelectTeam';
import {
  IconAlertSquareRounded,
  IconProgressCheck,
  IconSearch,
  IconSquareRotated,
  IconUser,
  IconUsers,
  IconRestore,
  IconUserPlus,
  IconHash,
} from '@tabler/icons-react';
import { Combobox, Command, Filter, useMultiQueryState } from 'erxes-ui';
import { SelectCreatorTask } from '@/task/components/task-selects/SelectCreatorTask';
import clsx from 'clsx';
import { useParams } from 'react-router-dom';
import { SelectMilestone } from './task-selects/SelectMilestone';
import { TagsFilter } from 'ui-modules';
import { useGetTeam } from '@/team/hooks/useGetTeam';
import { SelectEstimatedPoint } from '@/task/components/task-selects/SelectEstimatedPointTask';
import { TeamEstimateTypes } from '@/team/types';

const TasksFilterPopover = () => {
  const { teamId, projectId } = useParams();
  const { team } = useGetTeam({ variables: { _id: teamId }, skip: !teamId });
  const [queries] = useMultiQueryState<{
    searchValue: string;
    assignee: string;
    createdBy: string;
    team: string;
    priority: string;
    status: string;
    milestone: string;
    cycleFilter: string;
    estimatePoint: number;
  }>([
    'searchValue',
    'assignee',
    'team',
    'priority',
    'status',
    'milestone',
    'cycleFilter',
    'createdBy',
    'estimatePoint',
  ]);

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
                <Filter.Item value="createdBy">
                  <IconUserPlus />
                  Creator
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
                {(!teamId || (teamId && team?.cycleEnabled)) && (
                  <Filter.Item value="cycleFilter">
                    <IconRestore />
                    Cycle
                  </Filter.Item>
                )}
                {(!teamId ||
                  (teamId &&
                    team?.estimateType &&
                    String(team.estimateType) !==
                      TeamEstimateTypes.NOT_IN_USE)) && (
                  <Filter.Item value="estimatePoint">
                    <IconHash />
                    Estimate
                  </Filter.Item>
                )}
                <TagsFilter />
                {projectId && !queries?.milestone && (
                  <Filter.Item value="milestone">
                    <IconSquareRotated />
                    Milestone
                  </Filter.Item>
                )}
              </Command.List>
            </Command>
          </Filter.View>
          <SelectAssigneeTask.FilterView teamIds={[teamId || '']} />
          <SelectCreatorTask.FilterView />
          {!teamId && <SelectTeam.FilterView />}
          <SelectPriority.FilterView />
          {teamId ? (
            <SelectStatusTask.FilterView teamId={teamId} />
          ) : (
            <SelectStatus.FilterView />
          )}
          {(!teamId || (teamId && team?.cycleEnabled)) && (
            <SelectCycle.FilterView />
          )}
          {(!teamId ||
            (teamId &&
              team?.estimateType &&
              String(team.estimateType) !== TeamEstimateTypes.NOT_IN_USE)) && (
            <SelectEstimatedPoint.FilterView />
          )}
          <TagsFilter.View tagType="operation:task" />
          {projectId && !queries?.milestone && (
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
  const { team } = useGetTeam({ variables: { _id: teamId }, skip: !teamId });
  const [queries] = useMultiQueryState<{
    searchValue: string;
    assignee: string;
    createdBy: string;
    team: string;
    priority: string;
    status: string;
    milestone: string;
    tags: string[];
    cycleFilter: string;
    estimatePoint: number;
  }>([
    'searchValue',
    'assignee',
    'team',
    'priority',
    'status',
    'milestone',
    'tags',
    'createdBy',
    'cycleFilter',
    'estimatePoint',
  ]);
  const { searchValue, milestone, cycleFilter, estimatePoint } = queries || {};

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
        {(!teamId || (teamId && team?.cycleEnabled && cycleFilter)) && (
          <Filter.BarItem queryKey="cycleFilter">
            <Filter.BarName>
              <IconRestore />
              Cycle
            </Filter.BarName>
            <SelectCycle.FilterBar />
          </Filter.BarItem>
        )}
        {(!teamId ||
          (teamId &&
            team?.estimateType &&
            String(team.estimateType) !== TeamEstimateTypes.NOT_IN_USE)) &&
          estimatePoint && (
            <Filter.BarItem queryKey="estimatePoint">
              <Filter.BarName>
                <IconHash />
                Estimate
              </Filter.BarName>
              <SelectEstimatedPoint.FilterBar />
            </Filter.BarItem>
          )}
        <TagsFilter.Bar tagType="operation:task" />
        {projectId && milestone && (
          <Filter.BarItem queryKey="milestone">
            <Filter.BarName>
              <IconSquareRotated />
              Milestone
            </Filter.BarName>
            <SelectMilestone.FilterBar projectId={projectId} />
          </Filter.BarItem>
        )}
        <Filter.BarItem queryKey="createdBy">
          <Filter.BarName>
            <IconUserPlus />
            Creator
          </Filter.BarName>
          <SelectCreatorTask.FilterBar />
        </Filter.BarItem>
        <TasksFilterPopover />
        <TasksTotalCount />
      </Filter.Bar>
    </Filter>
  );
};
