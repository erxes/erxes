import {
    ImportHeaderDefinition,
  } from 'erxes-api-shared/core-modules';
  
  export async function getProjectExportHeaders(): Promise<ImportHeaderDefinition[]> {
    return [
      { label: 'Name', key: 'name', isDefault: true },
      { label: 'Description', key: 'description' },
      { label: 'Status', key: 'status' },
      { label: 'Priority', key: 'priority' },
      { label: 'Teams', key: 'teams' },
      { label: 'Tags', key: 'tags' },
      { label: 'Start Date', key: 'startDate' },
      { label: 'Target Date', key: 'targetDate' },
      { label: 'Lead', key: 'lead' },
      { label: 'Members', key: 'members' },
      { label: 'Created By', key: 'createdBy' },
      { label: 'Created At', key: 'createdAt' },
    ];
  }