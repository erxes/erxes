type Maps = {
  teamMap: Map<string, string>;
  statusMap: Map<string, string>;
  projectMap: Map<string, string>;
  cycleMap: Map<string, string>;
  milestoneMap: Map<string, string>;
  assigneeMap: Map<string, string>;
  tagMap: Map<string, string>;
};

const joinNames = (ids: any[] | undefined, map: Map<string, string>) => {
  if (!ids?.length) return '';
  return ids
    .map((id) => map.get(String(id)) || String(id))
    .filter(Boolean)
    .join('; ');
};

export const buildTaskExportRow = (
  task: any,
  selectedFields?: string[],
  maps?: Partial<Maps>,
): Record<string, any> => {
  const formatValue = (v: any) => (v == null ? '' : String(v));

  const teamName = task.teamId
    ? maps?.teamMap?.get(String(task.teamId)) || ''
    : '';
  const statusName = task.status
    ? maps?.statusMap?.get(String(task.status)) || ''
    : '';
  const projectName = task.projectId
    ? maps?.projectMap?.get(String(task.projectId)) || ''
    : '';
  const cycleName = task.cycleId
    ? maps?.cycleMap?.get(String(task.cycleId)) || ''
    : '';
  const milestoneName = task.milestoneId
    ? maps?.milestoneMap?.get(String(task.milestoneId)) || ''
    : '';
  const assigneeName = task.assigneeId
    ? maps?.assigneeMap?.get(String(task.assigneeId)) || ''
    : '';

  const allFields: Record<string, any> = {
    _id: formatValue(task._id),
    name: formatValue(task.name),
    description: formatValue(task.description),
    number: formatValue(task.number),
    teamId: formatValue(task.teamId),
    teamName: formatValue(teamName),
    status: formatValue(task.status),
    statusName: formatValue(statusName),
    statusType: formatValue(task.statusType),
    priority: formatValue(task.priority ?? 0),
    estimatePoint: formatValue(task.estimatePoint ?? 0),
    projectId: formatValue(task.projectId),
    projectName: formatValue(projectName),
    cycleId: formatValue(task.cycleId),
    cycleName: formatValue(cycleName),
    milestoneId: formatValue(task.milestoneId),
    milestoneName: formatValue(milestoneName),
    assigneeId: formatValue(task.assigneeId),
    assigneeName: formatValue(assigneeName),
    labelIds: formatValue((task.labelIds || []).join('; ')),
    tagIds: formatValue(task.tagIds),
    tagNames: formatValue(joinNames(task.tagIds, maps?.tagMap || new Map())),
    startDate: formatValue(
      task.startDate ? new Date(task.startDate).toISOString() : '',
    ),
    targetDate: formatValue(
      task.targetDate ? new Date(task.targetDate).toISOString() : '',
    ),
    statusChangedDate: formatValue(
      task.statusChangedDate
        ? new Date(task.statusChangedDate).toISOString()
        : '',
    ),
    createdAt: formatValue(
      task.createdAt ? new Date(task.createdAt).toISOString() : '',
    ),
    updatedAt: formatValue(
      task.updatedAt ? new Date(task.updatedAt).toISOString() : '',
    ),
  };

  // tagIds column should join raw IDs, not the array
  allFields.tagIds = formatValue((task.tagIds || []).join('; '));

  if (selectedFields?.length) {
    const result: Record<string, any> = { _id: String(task._id || '') };
    for (const key of selectedFields) {
      result[key] = allFields[key] ?? '';
    }
    return result;
  }

  return allFields;
};
