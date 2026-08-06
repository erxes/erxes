import {
  TICKET_DEFAULT_STATUSES,
  TICKET_PRIORITY_TYPES,
} from '@/ticket/constants/types';

type Maps = {
  assigneeMap: Map<string, string>;
  pipelineMap: Map<string, string>;
  tagMap: Map<string, string>;
  statusMap: Map<string, string>;
  channelMap: Map<string, string>;
  companyMap: Map<string, string>;
  customerMap: Map<string, string>;
  assigneeBranchMap: Map<string, string>;
  assigneeDepartmentMap: Map<string, string>;
};

const joinNames = (ids: any[] | undefined, map: Map<string, string>) => {
  if (!ids?.length) return '';
  return ids
    .map((id) => map.get(String(id)) || '')
    .filter(Boolean)
    .join('; ');
};

const getPriorityLabel = (priority?: number): string => {
  if (!priority) return '';
  const found = TICKET_PRIORITY_TYPES.find((p) => p.type === priority);
  return found?.name || '';
};

const getStatusLabel = (statusType?: number): string => {
  if (!statusType) return '';
  const found = TICKET_DEFAULT_STATUSES.find((s) => s.type === statusType);
  return found?.name || '';
};

export const buildTicketExportRow = (
  ticket: any,
  selectedFields?: string[],
  maps?: Partial<Maps>,
): Record<string, any> => {
  const formatValue = (v: any) => (v == null ? '' : String(v));

  const assigneeName = ticket.assigneeId
    ? maps?.assigneeMap?.get(String(ticket.assigneeId)) || ''
    : '';

  const pipelineName = ticket.pipelineId
    ? maps?.pipelineMap?.get(String(ticket.pipelineId)) || ''
    : '';

  const statusName = ticket.statusId
    ? maps?.statusMap?.get(String(ticket.statusId)) || ''
    : '';

  const channelName = ticket.channelId
    ? maps?.channelMap?.get(String(ticket.channelId)) || ''
    : '';

  const branchNames = ticket.assigneeId
    ? maps?.assigneeBranchMap?.get(String(ticket.assigneeId)) || ''
    : '';

  const departmentNames = ticket.assigneeId
    ? maps?.assigneeDepartmentMap?.get(String(ticket.assigneeId)) || ''
    : '';

  const tagNames = joinNames(ticket.tagIds, maps?.tagMap || new Map());
  const companyNames = joinNames(ticket.companyIds, maps?.companyMap || new Map());
  const customerNames = joinNames(
    ticket.customerFieldData?.customerIds,
    maps?.customerMap || new Map(),
  );

  const allFields: Record<string, any> = {
    _id: formatValue(ticket._id),
    name: formatValue(ticket.name),
    description: formatValue(ticket.description),
    type: formatValue(ticket.type),
    priority: formatValue(getPriorityLabel(ticket.priority)),
    statusId: formatValue(statusName),
    statusType: formatValue(getStatusLabel(ticket.statusType)),
    state: formatValue(ticket.state),
    assigneeId: formatValue(assigneeName),
    pipelineId: formatValue(pipelineName),
    channelId: formatValue(channelName),
    tagIds: formatValue(tagNames),
    number: formatValue(ticket.number),
    startDate: formatValue(ticket.startDate ? new Date(ticket.startDate) : ''),
    targetDate: formatValue(
      ticket.targetDate ? new Date(ticket.targetDate) : '',
    ),
    createdAt: formatValue(ticket.createdAt ? new Date(ticket.createdAt) : ''),
    updatedAt: formatValue(ticket.updatedAt ? new Date(ticket.updatedAt) : ''),
    branchIds: formatValue(branchNames),
    departmentIds: formatValue(departmentNames),
    customerIds: formatValue(customerNames),
    companyIds: formatValue(companyNames),
  };

  if (ticket.propertiesData && typeof ticket.propertiesData === 'object') {
    for (const [fieldId, value] of Object.entries(ticket.propertiesData)) {
      if (value !== undefined && value !== null) {
        allFields[`propertiesData.${fieldId}`] = formatValue(value);
      }
    }
  }

  if (selectedFields?.length) {
    const result: Record<string, any> = { _id: String(ticket._id || '') };
    for (const key of selectedFields) {
      if (key.startsWith('propertiesData.')) {
        const fieldId = key.replace('propertiesData.', '');
        result[key] = formatValue(ticket.propertiesData?.[fieldId]);
      } else {
        result[key] = allFields[key] ?? '';
      }
    }
    return result;
  }

  return allFields;
};
