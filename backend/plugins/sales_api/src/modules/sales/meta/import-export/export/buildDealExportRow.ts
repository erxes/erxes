type Maps = {
  stageMap: Map<string, string>;
  pipelineMap: Map<string, string>;
  userMap: Map<string, string>;
  tagMap: Map<string, string>;
  labelMap: Map<string, string>;
};

const joinNames = (ids: any[] | undefined, map: Map<string, string>) => {
  if (!ids?.length) return '';
  return ids
    .map((id) => map.get(String(id)) || String(id))
    .filter(Boolean)
    .join('; ');
};

export const buildDealExportRow = (
  deal: any,
  selectedFields?: string[],
  maps?: Partial<Maps>,
): Record<string, any> => {
  const formatValue = (v: any) => (v == null ? '' : String(v));

  const stageName = deal.stageId
    ? maps?.stageMap?.get(String(deal.stageId)) || ''
    : '';
  const pipelineName = deal._pipelineId
    ? maps?.pipelineMap?.get(String(deal._pipelineId)) || ''
    : '';

  const allFields: Record<string, any> = {
    _id: formatValue(deal._id),
    name: formatValue(deal.name),
    description: formatValue(deal.description),
    stageId: formatValue(stageName),
    pipelineId: formatValue(pipelineName),
    totalAmount: formatValue(deal.totalAmount ?? 0),
    priority: formatValue(deal.priority),
    status: formatValue(deal.status),
    assignedUserIds: formatValue(
      joinNames(deal.assignedUserIds, maps?.userMap || new Map()),
    ),
    tagIds: formatValue(joinNames(deal.tagIds, maps?.tagMap || new Map())),
    labelIds: formatValue(joinNames(deal.labelIds, maps?.labelMap || new Map())),
    branchIds: formatValue((deal.branchIds || []).join('; ')),
    departmentIds: formatValue((deal.departmentIds || []).join('; ')),
    number: formatValue(deal.number),
    startDate: formatValue(
      deal.startDate ? new Date(deal.startDate).toISOString() : '',
    ),
    closeDate: formatValue(
      deal.closeDate ? new Date(deal.closeDate).toISOString() : '',
    ),
    createdAt: formatValue(
      deal.createdAt ? new Date(deal.createdAt).toISOString() : '',
    ),
    updatedAt: formatValue(
      deal.updatedAt ? new Date(deal.updatedAt).toISOString() : '',
    ),
  };

  if (selectedFields?.length) {
    const result: Record<string, any> = { _id: String(deal._id || '') };
    for (const key of selectedFields) {
      result[key] = allFields[key] ?? '';
    }
    return result;
  }

  return allFields;
};
