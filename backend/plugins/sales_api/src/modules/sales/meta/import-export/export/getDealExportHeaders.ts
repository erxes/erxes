import {
  ImportHeaderDefinition,
  IImportExportContext,
} from 'erxes-api-shared/core-modules';

export async function getDealExportHeaders(
  _data: unknown,
  _ctx: IImportExportContext,
): Promise<ImportHeaderDefinition[]> {
  return [
    { key: 'name', label: 'Name', isDefault: true },
    { key: 'description', label: 'Description' },
    { key: 'stageId', label: 'Stage', isDefault: true },
    { key: 'pipelineId', label: 'Pipeline', isDefault: true },
    { key: 'totalAmount', label: 'Amount', isDefault: true },
    { key: 'priority', label: 'Priority' },
    { key: 'status', label: 'Status', isDefault: true },
    { key: 'assignedUserIds', label: 'Assigned Users', isDefault: true },
    { key: 'tagIds', label: 'Tags' },
    { key: 'labelIds', label: 'Labels' },
    { key: 'branchIds', label: 'Branches' },
    { key: 'departmentIds', label: 'Departments' },
    { key: 'number', label: 'Number' },
    { key: 'startDate', label: 'Start Date' },
    { key: 'closeDate', label: 'Close Date' },
    { key: 'createdAt', label: 'Created At', isDefault: true },
    { key: 'updatedAt', label: 'Updated At' },
  ];
}
