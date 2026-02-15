import { SelectPriority } from '@/operation/components/SelectPriority';
import { SelectStatus } from '@/operation/components/SelectStatus';
import { TaskHotKeyScope } from '@/task/TaskHotkeyScope';
import { TasksTotalCount } from '@/task/components/TasksTotalCount';
import { SelectAssigneeTask } from '@/task/components/task-selects/SelectAssigneeTask';
import { SelectStatusTask } from '@/task/components/task-selects/SelectStatusTask';
import { SelectCycle } from '@/task/components/task-selects/SelectCycle';
import { SelectProject } from '@/task/components/task-selects/SelectProjectTask';
import { TASKS_CURSOR_SESSION_KEY } from '@/task/constants';
import { SelectTeam } from '@/team/components/SelectTeam';
import { SelectLead } from '@/project/components/select/SelectLead';
import { ProjectMilestoneNameFilter } from '@/task/components/task-filters/ProjectMilestoneNameFilter';
import {
  IconAlertSquareRounded,
  IconProgressCheck,
  IconSearch,
  IconSquareRotated,
  IconUser,
  IconUsers,
  IconRestore,
  IconUserPlus,
  IconTriangle,
  IconClipboard,
  IconFlag,
  IconCalendarTime,
  IconCalendarEvent,
  IconCalendarPlus,
  IconCalendar,
  IconCalendarX,
} from '@tabler/icons-react';
import { Combobox, Command, Filter, useMultiQueryState } from 'erxes-ui';
import { SelectCreatorTask } from '@/task/components/task-selects/SelectCreatorTask';
import {
  SelectDueDateFilter,
  SelectCreatedDateFilter,
  SelectUpdatedDateFilter,
  SelectStartedDateFilter,
  SelectCompletedDateFilter,
} from '@/task/components/task-selects/SelectDateFilter';
import clsx from 'clsx';
import { useParams } from 'react-router-dom';
import { SelectMilestone } from './task-selects/SelectMilestone';
import { TagsFilter } from 'ui-modules';
import { useGetTeam } from '@/team/hooks/useGetTeam';
import { useGetProject } from '@/project/hooks/useGetProject';
import { SelectEstimatedPoint } from '@/task/components/task-selects/SelectEstimatedPointTask';
import { TeamEstimateTypes } from '@/team/types';

const TasksFilterPopover = () => {
  const { teamId, projectId } = useParams();
  const { team } = useGetTeam({ variables: { _id: teamId }, skip: !teamId });
  const { project } = useGetProject({
    variables: { _id: projectId },
    skip: !projectId || !!teamId,
  });
  const resolvedTeamIds = teamId
    ? [teamId]
    : project?.teamIds?.length
      ? project.teamIds
      : undefined;
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
    targetDate: string;
    createdDate: string;
    updatedDate: string;
    startDate: string;
    completedDate: string;
    project: string;
    projectStatus: string;
    projectPriority: string;
    projectLeadId: string;
    projectMilestoneName: string;
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
    'targetDate',
    'createdDate',
    'updatedDate',
    'startDate',
    'completedDate',
    'project',
    'projectStatus',
    'projectPriority',
    'projectLeadId',
    'projectMilestoneName',
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
                    <IconTriangle />
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
                <Command.Separator className="my-1" />
                <Command.Group heading="DATES">
                  <Filter.Item value="targetDate">
                    <IconCalendarEvent />
                    Due date
                  </Filter.Item>
                  <Filter.Item value="createdDate">
                    <IconCalendarPlus />
                    Created date
                  </Filter.Item>
                  <Filter.Item value="updatedDate">
                    <IconCalendar />
                    Updated date
                  </Filter.Item>
                  <Filter.Item value="startDate">
                    <IconCalendarTime />
                    Started date
                  </Filter.Item>
                  <Filter.Item value="completedDate">
                    <IconCalendarX />
                    Completed date
                  </Filter.Item>
                </Command.Group>
                <Command.Separator className="my-1" />
                <Command.Group heading="PROJECTS">
                  <Filter.Item value="project">
                    <IconClipboard />
                    Project
                  </Filter.Item>
                  <Filter.Item value="projectStatus">
                    <IconProgressCheck />
                    Project Status
                  </Filter.Item>
                  <Filter.Item value="projectPriority">
                    <IconFlag />
                    Project Priority
                  </Filter.Item>
                  <Filter.Item value="projectLeadId">
                    <IconUser />
                    Project Lead
                  </Filter.Item>
                  <Filter.Item value="projectMilestoneName" inDialog>
                    <IconSquareRotated />
                    Project Milestone Name
                  </Filter.Item>
                </Command.Group>
              </Command.List>
            </Command>
          </Filter.View>
          <SelectDueDateFilter.FilterView />
          <SelectCreatedDateFilter.FilterView />
          <SelectUpdatedDateFilter.FilterView />
          <SelectStartedDateFilter.FilterView />
          <SelectCompletedDateFilter.FilterView />
          <SelectProject.FilterView queryKey="project" />
          <SelectStatus.FilterView queryKey="projectStatus" />
          <SelectPriority.FilterView queryKey="projectPriority" />
          <SelectLead.FilterView queryKey="projectLeadId" />
          <SelectAssigneeTask.FilterView teamIds={resolvedTeamIds} />
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
        <ProjectMilestoneNameFilter.View queryKey="projectMilestoneName" />
      </Filter.Dialog>
    </>
  );
};

export const TasksFilter = () => {
  const { teamId, projectId } = useParams();
  const { team } = useGetTeam({ variables: { _id: teamId }, skip: !teamId });
  const { project } = useGetProject({
    variables: { _id: projectId },
    skip: !projectId || !!teamId,
  });
  const resolvedTeamIds = teamId
    ? [teamId]
    : project?.teamIds?.length
      ? project.teamIds
      : undefined;
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
    targetDate: string;
    createdDate: string;
    updatedDate: string;
    startDate: string;
    completedDate: string;
    project: string;
    projectStatus: string;
    projectPriority: string;
    projectLeadId: string;
    projectMilestoneName: string;
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
    'targetDate',
    'createdDate',
    'updatedDate',
    'startDate',
    'completedDate',
    'project',
    'projectStatus',
    'projectPriority',
    'projectLeadId',
    'projectMilestoneName',
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
        <Filter.BarItem queryKey="project">
          <Filter.BarName>
            <IconClipboard />
            Project
          </Filter.BarName>
          <SelectProject.FilterBar queryKey="project" />
        </Filter.BarItem>
        <Filter.BarItem queryKey="projectStatus">
          <Filter.BarName>
            <IconProgressCheck />
            Project Status
          </Filter.BarName>
          <SelectStatus.FilterBar queryKey="projectStatus" />
        </Filter.BarItem>
        <Filter.BarItem queryKey="projectPriority">
          <Filter.BarName>
            <IconFlag />
            Project Priority
          </Filter.BarName>
          <SelectPriority.FilterBar queryKey="projectPriority" />
        </Filter.BarItem>
        <Filter.BarItem queryKey="projectLeadId">
          <Filter.BarName>
            <IconUser />
            Project Lead
          </Filter.BarName>
          <SelectLead.FilterBar queryKey="projectLeadId" />
        </Filter.BarItem>
        <Filter.BarItem queryKey="projectMilestoneName">
          <Filter.BarName>
            <IconSquareRotated />
            Project Milestone Name
          </Filter.BarName>
          <ProjectMilestoneNameFilter.Bar queryKey="projectMilestoneName" />
        </Filter.BarItem>
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
          <SelectAssigneeTask.FilterBar teamIds={resolvedTeamIds} />
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
                <IconTriangle />
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
        <Filter.BarItem queryKey="targetDate">
          <Filter.BarName>
            <IconCalendarEvent />
            Due date
          </Filter.BarName>
          <SelectDueDateFilter.FilterBar />
        </Filter.BarItem>
        <Filter.BarItem queryKey="createdDate">
          <Filter.BarName>
            <IconCalendarPlus />
            Created
          </Filter.BarName>
          <SelectCreatedDateFilter.FilterBar />
        </Filter.BarItem>
        <Filter.BarItem queryKey="updatedDate">
          <Filter.BarName>
            <IconCalendar />
            Updated
          </Filter.BarName>
          <SelectUpdatedDateFilter.FilterBar />
        </Filter.BarItem>
        <Filter.BarItem queryKey="startDate">
          <Filter.BarName>
            <IconCalendarTime />
            Started
          </Filter.BarName>
          <SelectStartedDateFilter.FilterBar />
        </Filter.BarItem>
        <Filter.BarItem queryKey="completedDate">
          <Filter.BarName>
            <IconCalendarX />
            Completed
          </Filter.BarName>
          <SelectCompletedDateFilter.FilterBar />
        </Filter.BarItem>
        <TasksFilterPopover />
        <TasksTotalCount />
      </Filter.Bar>
    </Filter>
  );
};
