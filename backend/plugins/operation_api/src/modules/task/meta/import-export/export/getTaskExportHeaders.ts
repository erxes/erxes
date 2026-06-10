import {
    ImportHeaderDefinition,
  } from 'erxes-api-shared/core-modules';
  
  /** Returns the list of column header definitions for the task export handler. */
  export function getTaskExportHeaders(): Promise<ImportHeaderDefinition[]> {
    return Promise.resolve([
      { label: 'Name', key: 'name', isDefault: true },
      { label: 'Description', key: 'description' },
      { label: 'Status', key: 'status' },
      { label: 'Team', key: 'team' },
      { label: 'Priority', key: 'priority' },
      { label: 'Labels', key: 'labels' },
      { label: 'Tags', key: 'tags' },
      { label: 'Assignee', key: 'assignee' },
      { label: 'Created By', key: 'createdBy' },
      { label: 'Start Date', key: 'startDate' },
      { label: 'Target Date', key: 'targetDate' },
      { label: 'Cycle', key: 'cycle' },
      { label: 'Project', key: 'project' },
      { label: 'Milestone', key: 'milestone' },
      { label: 'Estimate Point', key: 'estimatePoint' },
      { label: 'Status Changed Date', key: 'statusChangedDate' },
      { label: 'Number', key: 'number' },
      { label: 'Status Type', key: 'statusType' },
      { label: 'Created At', key: 'createdAt' },
    ]);
  }
  