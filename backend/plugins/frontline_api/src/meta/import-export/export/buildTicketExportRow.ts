import {
  TICKET_DEFAULT_STATUSES,
  TICKET_PRIORITY_TYPES,
} from '@/ticket/constants/types';

type Maps = {
  assigneeMap: Map<string, string>;
  pipelineMap: Map<string, string>;
  tagMap: Map<string, string>;
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

  const tagNames = joinNames(ticket.tagIds, maps?.tagMap || new Map());

  const allFields: Record<string, any> = {
    _id: formatValue(ticket._id),
    name: formatValue(ticket.name),
    description: formatValue(ticket.description),
    type: formatValue(ticket.type),
    priority: formatValue(getPriorityLabel(ticket.priority)),
    statusType: formatValue(getStatusLabel(ticket.statusType)),
    state: formatValue(ticket.state),
    assigneeId: formatValue(assigneeName),
    pipelineId: formatValue(pipelineName),
    tagIds: formatValue(tagNames),
    number: formatValue(ticket.number),
    startDate: formatValue(ticket.startDate ? new Date(ticket.startDate) : ''),
    targetDate: formatValue(
      ticket.targetDate ? new Date(ticket.targetDate) : '',
    ),
    createdAt: formatValue(ticket.createdAt ? new Date(ticket.createdAt) : ''),
    updatedAt: formatValue(ticket.updatedAt ? new Date(ticket.updatedAt) : ''),
  };

  if (selectedFields?.length) {
    const result: Record<string, any> = { _id: String(ticket._id || '') };
    for (const key of selectedFields) {
      result[key] = allFields[key] ?? '';
    }
    return result;
  }

  return allFields;
};
