import {
  ImportHeaderDefinition,
  IImportExportContext,
} from 'erxes-api-shared/core-modules';

export async function getDealExportHeaders(
  _data: unknown,
  _ctx: IImportExportContext,
): Promise<ImportHeaderDefinition[]> {
  void _data;
  void _ctx;

  return [
    { label: 'ID', key: '_id' },
    { label: 'Number', key: 'number', isDefault: true },
    { label: 'Name', key: 'name', isDefault: true },
    { label: 'Pipeline', key: 'pipeline', isDefault: true },
    { label: 'Stage', key: 'stage', isDefault: true },
    { label: 'Status', key: 'status', isDefault: true },
    { label: 'Priority', key: 'priority', isDefault: true },
    { label: 'Total Amount', key: 'totalAmount', isDefault: true },
    { label: 'Unused Total Amount', key: 'unUsedTotalAmount' },
    { label: 'Both Total Amount', key: 'bothTotalAmount' },
    { label: 'Description', key: 'description' },
    { label: 'Start Date', key: 'startDate' },
    { label: 'Close Date', key: 'closeDate' },
    { label: 'Created At', key: 'createdAt', isDefault: true },
    { label: 'Updated At', key: 'updatedAt', isDefault: true },
    { label: 'Stage ID', key: 'stageId' },
    { label: 'Pipeline ID', key: 'pipelineId' },
    { label: 'Assigned Users', key: 'assignedUsers' },
    { label: 'Assigned User IDs', key: 'assignedUserIds' },
    { label: 'Owner', key: 'owner' },
    { label: 'Owner ID', key: 'userId' },
    { label: 'Customers', key: 'customers' },
    { label: 'Customer IDs', key: 'customerIds' },
    { label: 'Companies', key: 'companies' },
    { label: 'Company IDs', key: 'companyIds' },
    { label: 'Labels', key: 'labels' },
    { label: 'Label IDs', key: 'labelIds' },
    { label: 'Tags', key: 'tags' },
    { label: 'Tag IDs', key: 'tagIds' },
    { label: 'Branches', key: 'branches' },
    { label: 'Branch IDs', key: 'branchIds' },
    { label: 'Departments', key: 'departments' },
    { label: 'Department IDs', key: 'departmentIds' },
    { label: 'Products', key: 'products' },
    { label: 'Products JSON', key: 'productsData' },
  ];
}
