import {
  ImportHeaderDefinition,
  IImportExportContext,
} from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';
import { getTicketCustomPropertyHeaders } from '../utils';

export async function getTicketExportHeaders(
  _data: any,
  { subdomain }: IImportExportContext<IModels>,
): Promise<ImportHeaderDefinition[]> {
  const systemFields: ImportHeaderDefinition[] = [
    { label: 'Name', key: 'name', isDefault: true },
    { label: 'Description', key: 'description' },
    { label: 'Type', key: 'type', isDefault: true },
    { label: 'Priority', key: 'priority', isDefault: true },
    { label: 'Status', key: 'statusType', isDefault: true },
    { label: 'State', key: 'state', isDefault: true },
    { label: 'Assignee', key: 'assigneeId', isDefault: true },
    { label: 'Pipeline', key: 'pipelineId', isDefault: true },
    { label: 'Tags', key: 'tagIds' },
    { label: 'Number', key: 'number' },
    { label: 'Start Date', key: 'startDate' },
    { label: 'Due Date', key: 'targetDate' },
    { label: 'Created At', key: 'createdAt', isDefault: true },
    { label: 'Updated At', key: 'updatedAt' },
  ];

  const customFields = await getTicketCustomPropertyHeaders(subdomain);

  return [...systemFields, ...customFields];
}
