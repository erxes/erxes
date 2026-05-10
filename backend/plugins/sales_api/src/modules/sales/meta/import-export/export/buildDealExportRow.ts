type Maps = {
  stageMap: Map<string, string>;
  pipelineMap: Map<string, string>;
  userMap: Map<string, string>;
  tagMap: Map<string, string>;
  labelMap: Map<string, string>;
};

const joinNames = (ids: string[] | undefined, map: Map<string, string>) => {
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
  const fmt = (v: any) => (v == null ? '' : String(v));

  const stageName = deal.stageId
    ? maps?.stageMap?.get(String(deal.stageId)) || ''
    : '';
  const pipelineName = deal._pipelineId
    ? maps?.pipelineMap?.get(String(deal._pipelineId)) || ''
    : '';

  const allFields: Record<string, any> = {
    _id: fmt(deal._id),
    name: fmt(deal.name),
    description: fmt(deal.description),
    stageId: fmt(stageName),
    pipelineId: fmt(pipelineName),
    totalAmount: fmt(deal.totalAmount ?? 0),
    priority: fmt(deal.priority),
    status: fmt(deal.status),
    assignedUserIds: fmt(
      joinNames(deal.assignedUserIds, maps?.userMap || new Map()),
    ),
    tagIds: fmt(joinNames(deal.tagIds, maps?.tagMap || new Map())),
    labelIds: fmt(joinNames(deal.labelIds, maps?.labelMap || new Map())),
    branchIds: fmt((deal.branchIds || []).join('; ')),
    departmentIds: fmt((deal.departmentIds || []).join('; ')),
    number: fmt(deal.number),
    startDate: fmt(deal.startDate ? new Date(deal.startDate).toISOString() : ''),
    closeDate: fmt(deal.closeDate ? new Date(deal.closeDate).toISOString() : ''),
    createdAt: fmt(deal.createdAt ? new Date(deal.createdAt).toISOString() : ''),
    updatedAt: fmt(deal.updatedAt ? new Date(deal.updatedAt).toISOString() : ''),
  };

  if (selectedFields?.length) {
    const result: Record<string, any> = { _id: fmt(deal._id) };
    for (const key of selectedFields) {
      result[key] = allFields[key] ?? '';
    }
    return result;
  }

  return allFields;
};
