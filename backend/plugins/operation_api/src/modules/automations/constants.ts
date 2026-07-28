import {
  AutomationConstants,
  TAutomationRuntimeOutputDefinition,
  TAutomationSetPropertyTarget,
} from 'erxes-api-shared/core-modules';
import { IMilestone } from '@/milestone/types';
import { IProject } from '@/project/@types/project';
import { ITask } from '@/task/@types/task';
import { ITeam } from '@/team/@types/team';

export const OPERATION_TASK_TARGET_TYPE = 'operation:task.tasks';
export const OPERATION_PROJECT_TARGET_TYPE = 'operation:project.projects';
export const OPERATION_MILESTONE_TARGET_TYPE = 'operation:project.milestones';
export const OPERATION_TEAM_TARGET_TYPE = 'operation:team.teams';

export const OPERATION_PROJECT_COMPLETED_RELATION_TYPE = 'completed';
export const OPERATION_MILESTONE_REACHED_RELATION_TYPE = 'reached';
export const OPERATION_TEAM_COMPLETED_RELATION_TYPE = 'completed';

type TOperationCompletionModeKey = 'EVERY' | 'SOME' | 'FIRST' | 'LAST';

export type TOperationCompletionMode = 'every' | 'some' | 'first' | 'last';

export const OPERATION_COMPLETION_MODES: Record<
  TOperationCompletionModeKey,
  TOperationCompletionMode
> = {
  EVERY: 'every',
  SOME: 'some',
  FIRST: 'first',
  LAST: 'last',
};

type TOperationTaskAutomationTarget = ITask & {
  _id?: string;
  number?: number;
  updatedAt?: Date | string;
};

type TOperationProjectAutomationTarget = IProject & {
  _id?: string;
  icon?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
};

type TOperationMilestoneAutomationTarget = IMilestone & {
  _id?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
};

type TOperationTeamAutomationTarget = ITeam & {
  _id?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
};

const OPERATION_TASK_SET_PROPERTY_TARGETS: TAutomationSetPropertyTarget[] = [
  {
    label: 'Task',
    type: OPERATION_TASK_TARGET_TYPE,
    source: 'target',
    cardinality: 'one',
  },
];

const OPERATION_PROJECT_SET_PROPERTY_TARGETS: TAutomationSetPropertyTarget[] = [
  {
    label: 'Project',
    type: OPERATION_PROJECT_TARGET_TYPE,
    source: 'target',
    cardinality: 'one',
  },
];

const OPERATION_MILESTONE_SET_PROPERTY_TARGETS: TAutomationSetPropertyTarget[] =
  [
    {
      label: 'Milestone',
      type: OPERATION_MILESTONE_TARGET_TYPE,
      source: 'target',
      cardinality: 'one',
    },
  ];

const OPERATION_TEAM_SET_PROPERTY_TARGETS: TAutomationSetPropertyTarget[] = [
  {
    label: 'Team',
    type: OPERATION_TEAM_TARGET_TYPE,
    source: 'target',
    cardinality: 'one',
  },
];

const TASK_OUTPUT: TAutomationRuntimeOutputDefinition<TOperationTaskAutomationTarget> =
  {
    variables: [
      { key: '_id', label: 'Task ID', field: '_id' },
      { key: 'name', label: 'Task name' },
      { key: 'number', label: 'Task number' },
      { key: 'description', label: 'Description' },
      {
        key: 'status',
        label: 'Status',
        exposure: 'reference',
        field: 'status',
        referenceType: 'operation:status.statuses',
      },
      { key: 'statusType', label: 'Status type' },
      { key: 'priority', label: 'Priority' },
      {
        key: 'teamId',
        label: 'Team',
        exposure: 'reference',
        field: 'teamId',
        referenceType: OPERATION_TEAM_TARGET_TYPE,
      },
      {
        key: 'projectId',
        label: 'Project',
        exposure: 'reference',
        field: 'projectId',
        referenceType: OPERATION_PROJECT_TARGET_TYPE,
      },
      {
        key: 'milestoneId',
        label: 'Milestone',
        exposure: 'reference',
        field: 'milestoneId',
        referenceType: OPERATION_MILESTONE_TARGET_TYPE,
      },
      {
        key: 'cycleId',
        label: 'Cycle',
        exposure: 'reference',
        field: 'cycleId',
        referenceType: 'operation:cycle.cycles',
      },
      {
        key: 'assigneeId',
        label: 'Assignee',
        exposure: 'reference',
        field: 'assigneeId',
        referenceType: 'core:user',
      },
      {
        key: 'createdBy',
        label: 'Created by',
        exposure: 'reference',
        field: 'createdBy',
        referenceType: 'core:user',
      },
      { key: 'labelIds', label: 'Labels', exposure: 'reference' },
      { key: 'tagIds', label: 'Tags', exposure: 'reference' },
      { key: 'estimatePoint', label: 'Estimate point' },
      { key: 'startDate', label: 'Start date' },
      { key: 'targetDate', label: 'Target date' },
      { key: 'statusChangedDate', label: 'Status changed date' },
      { key: 'createdAt', label: 'Created at' },
      { key: 'updatedAt', label: 'Updated at' },
    ],
    propertySource: {
      key: 'properties',
      label: 'Task properties',
      propertyType: OPERATION_TASK_TARGET_TYPE,
    },
  };

const PROJECT_OUTPUT: TAutomationRuntimeOutputDefinition<TOperationProjectAutomationTarget> =
  {
    variables: [
      { key: '_id', label: 'Project ID', field: '_id' },
      { key: 'name', label: 'Project name' },
      { key: 'description', label: 'Description' },
      { key: 'status', label: 'Status' },
      { key: 'priority', label: 'Priority' },
      { key: 'icon', label: 'Icon' },
      {
        key: 'teamIds',
        label: 'Teams',
        exposure: 'reference',
        field: 'teamIds',
        referenceType: OPERATION_TEAM_TARGET_TYPE,
      },
      { key: 'tagIds', label: 'Tags', exposure: 'reference' },
      {
        key: 'leadId',
        label: 'Lead',
        exposure: 'reference',
        field: 'leadId',
        referenceType: 'core:user',
      },
      {
        key: 'memberIds',
        label: 'Members',
        exposure: 'reference',
        field: 'memberIds',
        referenceType: 'core:user',
      },
      {
        key: 'createdBy',
        label: 'Created by',
        exposure: 'reference',
        field: 'createdBy',
        referenceType: 'core:user',
      },
      {
        key: 'convertedFromId',
        label: 'Converted from task',
        exposure: 'reference',
        field: 'convertedFromId',
        referenceType: OPERATION_TASK_TARGET_TYPE,
      },
      { key: 'startDate', label: 'Start date' },
      { key: 'targetDate', label: 'Target date' },
      { key: 'createdAt', label: 'Created at' },
      { key: 'updatedAt', label: 'Updated at' },
    ],
    propertySource: {
      key: 'properties',
      label: 'Project properties',
      propertyType: OPERATION_PROJECT_TARGET_TYPE,
    },
  };

const MILESTONE_OUTPUT: TAutomationRuntimeOutputDefinition<TOperationMilestoneAutomationTarget> =
  {
    variables: [
      { key: '_id', label: 'Milestone ID', field: '_id' },
      { key: 'name', label: 'Milestone name' },
      { key: 'description', label: 'Description' },
      { key: 'targetDate', label: 'Target date' },
      {
        key: 'projectId',
        label: 'Project',
        exposure: 'reference',
        field: 'projectId',
        referenceType: OPERATION_PROJECT_TARGET_TYPE,
      },
      {
        key: 'createdBy',
        label: 'Created by',
        exposure: 'reference',
        field: 'createdBy',
        referenceType: 'core:user',
      },
      { key: 'createdAt', label: 'Created at' },
      { key: 'updatedAt', label: 'Updated at' },
    ],
    propertySource: {
      key: 'properties',
      label: 'Milestone properties',
      propertyType: OPERATION_MILESTONE_TARGET_TYPE,
    },
  };

const TEAM_OUTPUT: TAutomationRuntimeOutputDefinition<TOperationTeamAutomationTarget> =
  {
    variables: [
      { key: '_id', label: 'Team ID', field: '_id' },
      { key: 'name', label: 'Team name' },
      { key: 'description', label: 'Description' },
      { key: 'icon', label: 'Icon' },
      { key: 'estimateType', label: 'Estimate type' },
      { key: 'cycleEnabled', label: 'Cycle enabled' },
      { key: 'triageEnabled', label: 'Triage enabled' },
      { key: 'createdAt', label: 'Created at' },
      { key: 'updatedAt', label: 'Updated at' },
    ],
    propertySource: {
      key: 'properties',
      label: 'Team properties',
      propertyType: OPERATION_TEAM_TARGET_TYPE,
    },
  };

export const operationAutomationConstants: AutomationConstants = {
  triggers: [
    {
      moduleName: 'task',
      collectionName: 'tasks',
      icon: 'IconCheckbox',
      label: 'Task',
      description:
        'Start this workflow when operation tasks match the enrollment segment.',
      output: TASK_OUTPUT,
      setPropertyTargets: OPERATION_TASK_SET_PROPERTY_TARGETS,
    },
    {
      moduleName: 'project',
      collectionName: 'projects',
      icon: 'IconFolder',
      label: 'Project',
      description:
        'Start this workflow when operation projects match the enrollment segment.',
      output: PROJECT_OUTPUT,
      setPropertyTargets: OPERATION_PROJECT_SET_PROPERTY_TARGETS,
    },
    {
      moduleName: 'project',
      collectionName: 'projects',
      relationType: OPERATION_PROJECT_COMPLETED_RELATION_TYPE,
      icon: 'IconFolderOpen',
      label: 'Project completed',
      description:
        'Start this workflow when every task in a project is completed.',
      isCustom: true,
      output: PROJECT_OUTPUT,
      setPropertyTargets: OPERATION_PROJECT_SET_PROPERTY_TARGETS,
    },
    {
      moduleName: 'project',
      collectionName: 'milestones',
      relationType: OPERATION_MILESTONE_REACHED_RELATION_TYPE,
      icon: 'IconFlag',
      label: 'Milestone reached',
      description:
        'Start this workflow when project milestone tasks reach the selected completion mode.',
      isCustom: true,
      output: MILESTONE_OUTPUT,
      setPropertyTargets: OPERATION_MILESTONE_SET_PROPERTY_TARGETS,
    },
    {
      moduleName: 'team',
      collectionName: 'teams',
      relationType: OPERATION_TEAM_COMPLETED_RELATION_TYPE,
      icon: 'IconUsersGroup',
      label: 'Team work completed',
      description:
        'Start this workflow when team tasks reach the selected completion mode.',
      isCustom: true,
      output: TEAM_OUTPUT,
      setPropertyTargets: OPERATION_TEAM_SET_PROPERTY_TARGETS,
    },
  ],
  actions: [
    {
      moduleName: 'task',
      collectionName: 'tasks',
      method: 'create',
      icon: 'IconCheckbox',
      label: 'Create task',
      description: 'Create an operation task with required task fields.',
      isTargetSource: true,
      targetSourceType: OPERATION_TASK_TARGET_TYPE,
      allowTargetFromActions: true,
      output: TASK_OUTPUT,
      setPropertyTargets: OPERATION_TASK_SET_PROPERTY_TARGETS,
    },
    {
      moduleName: 'project',
      collectionName: 'projects',
      method: 'create',
      icon: 'IconFolderPlus',
      label: 'Create project',
      description: 'Create an operation project with required project fields.',
      isTargetSource: true,
      targetSourceType: OPERATION_PROJECT_TARGET_TYPE,
      allowTargetFromActions: true,
      output: PROJECT_OUTPUT,
      setPropertyTargets: OPERATION_PROJECT_SET_PROPERTY_TARGETS,
    },
  ],
  setPropertyTargets: [
    ...OPERATION_TASK_SET_PROPERTY_TARGETS,
    ...OPERATION_PROJECT_SET_PROPERTY_TARGETS,
    ...OPERATION_MILESTONE_SET_PROPERTY_TARGETS,
    ...OPERATION_TEAM_SET_PROPERTY_TARGETS,
  ],
};
