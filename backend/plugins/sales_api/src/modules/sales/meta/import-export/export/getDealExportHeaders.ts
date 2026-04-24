import {
  ImportHeaderDefinition,
  IImportExportContext,
} from 'erxes-api-shared/core-modules';

export async function getDealExportHeaders(
  _data: any,
  _ctx: IImportExportContext,
): Promise<ImportHeaderDefinition[]> {
  return [
    { label: 'Name', key: 'name', isDefault: true },
    { label: 'Description', key: 'description' },
    { label: 'Stage', key: 'stageId', isDefault: true },
    { label: 'Pipeline', key: 'pipelineId', isDefault: true },
    { label: 'Amount', key: 'totalAmount', isDefault: true },
    { label: 'Priority', key: 'priority' },
    { label: 'Status', key: 'status', isDefault: true },
    { label: 'Assigned Users', key: 'assignedUserIds', isDefault: true },
    { label: 'Tags', key: 'tagIds' },
    { label: 'Labels', key: 'labelIds' },
    { label: 'Branches', key: 'branchIds' },
    { label: 'Departments', key: 'departmentIds' },
    { label: 'Number', key: 'number' },
    { label: 'Start Date', key: 'startDate' },
    { label: 'Close Date', key: 'closeDate' },
    { label: 'Created At', key: 'createdAt', isDefault: true },
    { label: 'Updated At', key: 'updatedAt' },
  ];
}
