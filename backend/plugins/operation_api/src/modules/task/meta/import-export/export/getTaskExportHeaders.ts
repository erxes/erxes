import {
  ImportHeaderDefinition,
  IImportExportContext,
} from 'erxes-api-shared/core-modules';

export async function getTaskExportHeaders(
  _data: any,
  _ctx: IImportExportContext,
): Promise<ImportHeaderDefinition[]> {
  return [
    { label: 'Name', key: 'name', isDefault: true },
    { label: 'Number', key: 'number', isDefault: true },
    { label: 'Description', key: 'description' },
    { label: 'Team ID', key: 'teamId', isDefault: true },
    { label: 'Team Name', key: 'teamName' },
    { label: 'Status ID', key: 'status' },
    { label: 'Status Name', key: 'statusName', isDefault: true },
    { label: 'Status Type', key: 'statusType' },
    { label: 'Priority', key: 'priority', isDefault: true },
    { label: 'Estimate Point', key: 'estimatePoint' },
    { label: 'Project ID', key: 'projectId' },
    { label: 'Project Name', key: 'projectName' },
    { label: 'Cycle ID', key: 'cycleId' },
    { label: 'Cycle Name', key: 'cycleName' },
    { label: 'Milestone ID', key: 'milestoneId' },
    { label: 'Milestone Name', key: 'milestoneName' },
    { label: 'Assignee ID', key: 'assigneeId' },
    { label: 'Assignee Name', key: 'assigneeName', isDefault: true },
    { label: 'Labels', key: 'labelIds' },
    { label: 'Tags', key: 'tagIds' },
    { label: 'Tag Names', key: 'tagNames' },
    { label: 'Start Date', key: 'startDate' },
    { label: 'Target Date', key: 'targetDate' },
    { label: 'Status Changed Date', key: 'statusChangedDate' },
    { label: 'Created At', key: 'createdAt', isDefault: true },
    { label: 'Updated At', key: 'updatedAt' },
  ];
}
