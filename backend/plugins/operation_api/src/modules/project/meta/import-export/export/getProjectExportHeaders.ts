import {
  ImportHeaderDefinition,
  IImportExportContext,
} from 'erxes-api-shared/core-modules';

export async function getProjectExportHeaders(
  _data: any,
  _ctx: IImportExportContext,
): Promise<ImportHeaderDefinition[]> {
  return [
    { label: 'Name', key: 'name', isDefault: true },
    { label: 'Description', key: 'description' },
    { label: 'Team IDs', key: 'teamIds', isDefault: true },
    { label: 'Team Names', key: 'teamNames' },
    { label: 'Member IDs', key: 'memberIds' },
    { label: 'Member Names', key: 'memberNames' },
    { label: 'Lead ID', key: 'leadId' },
    { label: 'Lead Name', key: 'leadName', isDefault: true },
    { label: 'Priority', key: 'priority', isDefault: true },
    { label: 'Status', key: 'status', isDefault: true },
    { label: 'Tags', key: 'tagIds' },
    { label: 'Tag Names', key: 'tagNames' },
    { label: 'Start Date', key: 'startDate' },
    { label: 'Target Date', key: 'targetDate' },
    { label: 'Created At', key: 'createdAt', isDefault: true },
    { label: 'Updated At', key: 'updatedAt' },
  ];
}
