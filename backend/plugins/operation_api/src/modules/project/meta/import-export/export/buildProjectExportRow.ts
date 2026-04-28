type Maps = {
  teamMap: Map<string, string>;
  memberMap: Map<string, string>;
  leadMap: Map<string, string>;
  tagMap: Map<string, string>;
};

const joinNames = (ids: any[] | undefined, map: Map<string, string>) => {
  if (!ids?.length) return '';
  return ids
    .map((id) => map.get(String(id)) || String(id))
    .filter(Boolean)
    .join('; ');
};

export const buildProjectExportRow = (
  project: any,
  selectedFields?: string[],
  maps?: Partial<Maps>,
): Record<string, any> => {
  const formatValue = (v: any) => (v == null ? '' : String(v));

  const leadName = project.leadId
    ? maps?.leadMap?.get(String(project.leadId)) || ''
    : '';

  const allFields: Record<string, any> = {
    _id: formatValue(project._id),
    name: formatValue(project.name),
    description: formatValue(project.description),
    teamIds: formatValue((project.teamIds || []).join('; ')),
    teamNames: formatValue(
      joinNames(project.teamIds, maps?.teamMap || new Map()),
    ),
    memberIds: formatValue((project.memberIds || []).join('; ')),
    memberNames: formatValue(
      joinNames(project.memberIds, maps?.memberMap || new Map()),
    ),
    leadId: formatValue(project.leadId),
    leadName: formatValue(leadName),
    priority: formatValue(project.priority ?? 0),
    status: formatValue(project.status ?? 0),
    tagIds: formatValue((project.tagIds || []).join('; ')),
    tagNames: formatValue(
      joinNames(project.tagIds, maps?.tagMap || new Map()),
    ),
    startDate: formatValue(
      project.startDate ? new Date(project.startDate).toISOString() : '',
    ),
    targetDate: formatValue(
      project.targetDate ? new Date(project.targetDate).toISOString() : '',
    ),
    createdAt: formatValue(
      project.createdAt ? new Date(project.createdAt).toISOString() : '',
    ),
    updatedAt: formatValue(
      project.updatedAt ? new Date(project.updatedAt).toISOString() : '',
    ),
  };

  if (selectedFields?.length) {
    const result: Record<string, any> = { _id: String(project._id || '') };
    for (const key of selectedFields) {
      result[key] = allFields[key] ?? '';
    }
    return result;
  }

  return allFields;
};
