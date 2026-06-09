import { PROJECT_PRIORITIES_OPTIONS } from '@/operation/constants/priorityLabels';

export const OPERATION_TASK_TARGET_TYPE = 'operation:task.tasks';
export const OPERATION_PROJECT_TARGET_TYPE = 'operation:project.projects';

export const OPERATION_COMPLETION_MODE_OPTIONS = [
  { value: 'every', label: 'Every' },
  { value: 'some', label: 'Some' },
  { value: 'first', label: 'First' },
  { value: 'last', label: 'Last' },
];

export const TASK_ACTION_LABELS: Record<string, string> = {
  name: 'Name',
  description: 'Description',
  teamId: 'Team ID',
  status: 'Status ID',
  priority: 'Priority',
  assigneeId: 'Assignee',
  projectId: 'Project ID',
  milestoneId: 'Milestone ID',
  startDate: 'Start date',
  targetDate: 'Target date',
  tagIds: 'Tags',
};

export const PROJECT_ACTION_LABELS: Record<string, string> = {
  name: 'Name',
  description: 'Description',
  teamIds: 'Teams',
  status: 'Status',
  priority: 'Priority',
  leadId: 'Lead',
  memberIds: 'Members',
  startDate: 'Start date',
  targetDate: 'Target date',
  tagIds: 'Tags',
};

export const getPriorityLabel = (value: unknown) => {
  const priority = Number(value);

  return PROJECT_PRIORITIES_OPTIONS[priority] || String(value || '');
};

export const getOptionLabel = (
  options: Array<{ value: string; label: string }>,
  value?: string,
) => options.find((option) => option.value === value)?.label || value || '';
