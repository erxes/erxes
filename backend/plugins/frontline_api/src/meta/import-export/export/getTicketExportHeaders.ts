import {
  ImportHeaderDefinition,
  IImportExportContext,
} from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';
import { getTicketCustomPropertyHeaders } from '../utils';
import { TICKET_PRIORITY_TYPES } from '@/ticket/constants/types';

export async function getTicketExportHeaders(
  _data: any,
  { subdomain }: IImportExportContext<IModels>,
): Promise<ImportHeaderDefinition[]> {
  const systemFields: ImportHeaderDefinition[] = [
    { label: 'Name', key: 'name', isDefault: true, fieldType: 'text' },
    { label: 'Description', key: 'description', fieldType: 'text' },
    { label: 'Type', key: 'type', isDefault: true, fieldType: 'text' },
    {
      label: 'Priority',
      key: 'priority',
      isDefault: true,
      fieldType: 'select',
      options: TICKET_PRIORITY_TYPES.map((p) => ({
        label: p.name,
        value: String(p.type),
      })),
    },
    {
      label: 'Status',
      key: 'statusId',
      isDefault: true,
      fieldType: 'relation',
      relationKind: 'frontline:status',
    },
    {
      label: 'Status Type',
      key: 'statusType',
      isDefault: true,
      fieldType: 'text',
    },
    { label: 'State', key: 'state', isDefault: true, fieldType: 'text' },
    {
      label: 'Assignee',
      key: 'assigneeId',
      isDefault: true,
      fieldType: 'relation',
      relationKind: 'core:teamMembers',
    },
    {
      label: 'Pipeline',
      key: 'pipelineId',
      isDefault: true,
      fieldType: 'relation',
      relationKind: 'frontline:pipeline',
    },
    {
      label: 'Channel',
      key: 'channelId',
      fieldType: 'relation',
      relationKind: 'frontline:channel',
    },
    { label: 'Tags', key: 'tagIds', fieldType: 'text' },
    { label: 'Number', key: 'number', fieldType: 'number' },
    { label: 'Start Date', key: 'startDate', fieldType: 'date' },
    { label: 'Due Date', key: 'targetDate', fieldType: 'date' },
    {
      label: 'Created At',
      key: 'createdAt',
      isDefault: true,
      fieldType: 'date',
    },
    { label: 'Updated At', key: 'updatedAt', fieldType: 'date' },
    { label: 'Branch', key: 'branchIds' },
    { label: 'Department', key: 'departmentIds' },
    { label: 'Customer', key: 'customerIds' },
    { label: 'Companies', key: 'companyIds' },
  ];

  const customFields = await getTicketCustomPropertyHeaders(subdomain);

  return [...systemFields, ...customFields];
}
