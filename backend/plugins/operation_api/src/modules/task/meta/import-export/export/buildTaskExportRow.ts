import { ITaskDocument } from '../../../@types/task';
import { defaultTaskFieldFormatter, cleanDescription } from '../utils';


const getDeepValue = (obj: any, path: string) => {
  if (!path.includes('.')) return obj?.[path];
  return path.split('.').reduce((acc, key) => (acc ? acc[key] : undefined), obj);
};

export const buildTaskExportRow = (
  task: ITaskDocument & { number?: number },
  selectedFields?: string[],
  maps?: {
    statusMap?: Map<string, string>;
    projectMap?: Map<string, string>;
    cycleMap?: Map<string, string>;
    milestoneMap?: Map<string, string>;
    assigneeMap?: Map<string, string>;
    creatorMap?: Map<string, string>;
    teamMap?: Map<string, string>;
    tagMap?: Map<string, string>;
    labelMap?: Map<string, string>;
  },
  formatter = defaultTaskFieldFormatter,
): Record<string, any> => {
  const formatValue = formatter || defaultTaskFieldFormatter;

  const {
    statusMap,
    projectMap,
    cycleMap,
    milestoneMap,
    assigneeMap,
    creatorMap,
    teamMap,
    tagMap,
    labelMap,
  } = maps || {};

  const formatTags = (tagIds?: any[]) => {
    if (!tagIds || !tagIds.length) return '';
    return tagIds.map((id) => tagMap?.get(String(id)) || String(id)).join(', ');
  };

  const formatLabels = (labelIds?: any[]) => {
    if (!labelIds || !labelIds.length) return '';
    return labelIds.map((id) => labelMap?.get(String(id)) || String(id)).join(', ');
  };

  const allFields: Record<string, any> = {
    _id: formatValue(task._id),
    name: formatValue(task.name),
    description: formatValue(cleanDescription(task.description)),

    status: formatValue(statusMap?.get(String(task.status)) || task.status),
    team: formatValue(teamMap?.get(String(task.teamId)) || task.teamId),
    priority: formatValue(task.priority),
    labels: formatValue(formatLabels(task.labelIds)),
    tags: formatValue(formatTags(task.tagIds)),
    assignee: formatValue(assigneeMap?.get(String(task.assigneeId)) || task.assigneeId),
    createdBy: formatValue(creatorMap?.get(String(task.createdBy)) || task.createdBy),

    startDate: formatValue(task.startDate ? new Date(task.startDate) : ''),
    targetDate: formatValue(task.targetDate ? new Date(task.targetDate) : ''),

    cycle: formatValue(cycleMap?.get(String(task.cycleId)) || task.cycleId),
    project: formatValue(projectMap?.get(String(task.projectId)) || task.projectId),
    milestone: formatValue(milestoneMap?.get(String(task.milestoneId)) || task.milestoneId),

    estimatePoint: formatValue(task.estimatePoint),
    statusChangedDate: formatValue(task.statusChangedDate ? new Date(task.statusChangedDate) : ''),
    number: formatValue(task.number),
    statusType: formatValue(task.statusType),
    createdAt: formatValue(task.createdAt ? new Date(task.createdAt) : ''),
  };

  if (selectedFields?.length) {
    const result: Record<string, any> = { _id: String(task._id || '') };

    for (const key of selectedFields) {
      if (key === 'description') result[key] = formatValue(cleanDescription(task.description));
      else if (key === 'status') result[key] = formatValue(statusMap?.get(String(task.status)) || task.status);
      else if (key === 'team') result[key] = formatValue(teamMap?.get(String(task.teamId)) || task.teamId);
      else if (key === 'labels') result[key] = formatValue(formatLabels(task.labelIds));
      else if (key === 'tags') result[key] = formatValue(formatTags(task.tagIds));
      else if (key === 'assignee') result[key] = formatValue(assigneeMap?.get(String(task.assigneeId)) || task.assigneeId);
      else if (key === 'createdBy') result[key] = formatValue(creatorMap?.get(String(task.createdBy)) || task.createdBy);
      else if (key === 'project') result[key] = formatValue(projectMap?.get(String(task.projectId)) || task.projectId);
      else if (key === 'cycle') result[key] = formatValue(cycleMap?.get(String(task.cycleId)) || task.cycleId);
      else if (key === 'milestone') result[key] = formatValue(milestoneMap?.get(String(task.milestoneId)) || task.milestoneId);
      else result[key] = formatValue(getDeepValue(task, key));
    }

    return result;
  }

  return allFields;
};
